-- =========================================================
-- 20260719091400_anomaly_detection.sql
-- PKRates v1.5 — Requirement 2: Anomaly Detection System.
--
-- ARCHITECTURAL REVIEW FIRST: the schema already had everything
-- this system needed except the logic itself —
--   - `rate_verifications` (migration 002) already existed to
--     record a check's outcome.
--   - `*_submissions.status` (migrations 003/004/007/008) already
--     had 'flagged_anomaly' as a valid value.
--   - `sources.reliability_tier` (migration 002) already existed
--     as the source-confidence signal.
--   - The admin panel's RateDomainAdmin component already renders
--     `flagged_anomaly` submissions with a warning callout (see
--     the earlier admin-panel build) — it was built anticipating
--     this exact status, so NO frontend change is needed for
--     flagged items to surface correctly; this migration is the
--     first thing that actually sets that status for a real
--     reason instead of it only ever appearing in mock data.
-- What was genuinely missing: nothing computed a deviation,
-- nothing consulted reliability_tier, and nothing wrote to
-- rate_verifications automatically. This migration adds exactly
-- that — no table is redesigned, no column added to any fact or
-- submission table beyond what migrations 003-009 already defined.
--
-- SCOPE: per the approved Data Architecture (Section 9),
-- deviation-based anomaly detection is only meaningful for Gold,
-- Currency, Cement, and Steel — the four domains where a rate is
-- a continuous, comparable time series. Petrol and Prize Bonds
-- are event-sourced (official notifications / draw results) and
-- were explicitly excluded from deviation checking in that same
-- document; this migration does not add checks for them, per
-- "do not redesign unless absolutely necessary." Crypto has no
-- submission table at all (api_auto, direct fact-table insert) —
-- also as designed, not changed here.
-- =========================================================

-- ---------------------------------------------------------
-- Shared deviation evaluator. One implementation, called by
-- each domain's trigger below, so the "validate against source
-- confidence" rule is defined exactly once rather than repeated
-- (and risking drift) across four trigger functions.
-- ---------------------------------------------------------
create or replace function evaluate_rate_deviation(
    p_previous_value numeric,
    p_proposed_value numeric,
    p_source_id uuid,
    p_domain_threshold_pct numeric
) returns table (deviation_percent numeric, is_anomalous boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_deviation numeric;
    v_tier smallint;
    v_effective_threshold numeric;
begin
    select reliability_tier into v_tier from sources where id = p_source_id;

    -- No prior published value for this exact dimension (e.g. the
    -- very first rate ever recorded for a city/karat combination)
    -- -- nothing to compare against, so it cannot be anomalous.
    -- This also protects against a divide-by-zero below.
    if p_previous_value is null or p_previous_value = 0 then
        return query select 0::numeric, false, 'no_prior_value_to_compare'::text;
        return;
    end if;

    v_deviation := round(abs(p_proposed_value - p_previous_value) / p_previous_value * 100, 3);

    -- "Validate against source confidence": the same raw deviation
    -- is treated differently depending on how much the source has
    -- earned our trust (sources.reliability_tier, 1 = highest).
    -- A tier-1 source (e.g. an official association with a strong
    -- track record) gets more benefit of the doubt on a large swing
    -- than a newly onboarded, unproven tier-4/5 source reporting the
    -- exact same move. This directly reuses the tiering system the
    -- Source Management System (Data Architecture Section 10)
    -- already defined for a different purpose (auto-publish
    -- eligibility) -- one field, two consumers, no schema change.
    v_effective_threshold := p_domain_threshold_pct * case
        when v_tier <= 2 then 1.25   -- high-trust: 25% more leeway
        when v_tier = 3 then 1.0     -- baseline (the default onboarding tier)
        else 0.6                     -- low-trust (tier 4-5): stricter, not looser
    end;

    if v_deviation > v_effective_threshold then
        return query select
            v_deviation,
            true,
            format(
                'Deviation %.2f%% exceeds the effective threshold %.2f%% (domain base %.2f%%, source reliability tier %s).',
                v_deviation, v_effective_threshold, p_domain_threshold_pct, coalesce(v_tier::text, 'unknown')
            );
    else
        return query select v_deviation, false, null::text;
    end if;
end;
$$;

-- ---------------------------------------------------------
-- Shared logging step: one anomaly-check record + (only when
-- flagged) one audit_logs entry + one pg_notify — reused by
-- every domain trigger below via a single function call rather
-- than four copies of the same three statements.
-- ---------------------------------------------------------
create or replace function record_rate_verification(
    p_domain text,
    p_submission_table text,
    p_submission_id uuid,
    p_deviation_percent numeric,
    p_is_anomalous boolean,
    p_reason text,
    p_source_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into rate_verifications (
        domain, submission_table, submission_id, method,
        corroborating_source_ids, deviation_percent, verified, checked_at
    ) values (
        p_domain, p_submission_table, p_submission_id, 'deviation_check',
        array[p_source_id], p_deviation_percent, not p_is_anomalous, now()
    );

    if p_is_anomalous then
        -- "Record every anomaly in the Audit Log" -- the audit_logs
        -- table (migration 002) already had 'verify' as a valid
        -- action, anticipating exactly this use.
        insert into audit_logs (entity_table, entity_id, domain, action, new_value, performed_by_system, notes)
        values (
            p_submission_table, p_submission_id, p_domain, 'verify',
            jsonb_build_object('deviation_percent', p_deviation_percent, 'flagged', true),
            'anomaly-detector', p_reason
        );

        -- "Notify the admin dashboard" -- a dedicated channel,
        -- separate from `pkrates_rate_published` (migration 011),
        -- so an admin-panel Realtime subscription can distinguish
        -- "something new to review" from "something went live."
        -- No new table needed for this -- pg_notify is the transport.
        perform pg_notify('pkrates_anomaly_flagged', json_build_object(
            'domain', p_domain,
            'table', p_submission_table,
            'submission_id', p_submission_id,
            'deviation_percent', p_deviation_percent,
            'reason', p_reason
        )::text);
    end if;
end;
$$;

-- =========================================================
-- Domain triggers. Each is BEFORE INSERT (not AFTER) so the
-- anomaly check can set NEW.status directly -- one write, not
-- an insert followed by a corrective update. "Never publish
-- suspicious data automatically" is enforced here structurally:
-- this trigger can only ever move a row toward 'flagged_anomaly'
-- (stricter review) -- it has no code path that sets 'approved'
-- or touches any fact table. Publishing still only ever happens
-- through the human-approval triggers in migration 011.
-- =========================================================

-- ---------------------------------------------------------
-- Gold -- base threshold 4% (Data Architecture, Section 9)
-- ---------------------------------------------------------
create or replace function check_gold_rate_anomaly()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_previous numeric;
    v_deviation numeric;
    v_anomalous boolean;
    v_reason text;
begin
    select rate_per_tola into v_previous
    from gold_rates
    where city_id = NEW.city_id and karat_id = NEW.karat_id and status = 'published'
    order by effective_at desc limit 1;

    select deviation_percent, is_anomalous, reason
    into v_deviation, v_anomalous, v_reason
    from evaluate_rate_deviation(v_previous, NEW.rate_per_tola, NEW.source_id, 4.0);

    if v_anomalous then
        NEW.status := 'flagged_anomaly';
        NEW.reviewer_notes := coalesce(NEW.reviewer_notes || ' | ', '') || 'Auto-flagged: ' || v_reason;
    end if;

    -- NEW.id is already populated at this point -- column defaults
    -- (including uuid_generate_v4()) resolve before a BEFORE INSERT
    -- trigger runs, so it's safe to reference here.
    perform record_rate_verification('gold', 'gold_rate_submissions', NEW.id, v_deviation, v_anomalous, v_reason, NEW.source_id);

    return NEW;
end;
$$;

create trigger trg_check_gold_rate_anomaly
    before insert on gold_rate_submissions
    for each row execute function check_gold_rate_anomaly();

-- ---------------------------------------------------------
-- Currency -- open market 2%, interbank 1% (interbank comes
-- from an official, regulated source and should barely move
-- between publications, so it earns a stricter default even
-- though the Data Architecture only named an explicit number
-- for open market -- documented here rather than left implicit).
-- ---------------------------------------------------------
create or replace function check_currency_rate_anomaly()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_previous numeric;
    v_deviation numeric;
    v_anomalous boolean;
    v_reason text;
    v_threshold numeric;
begin
    select sell_rate into v_previous
    from currency_rates
    where currency_id = NEW.currency_id and rate_type = NEW.rate_type and status = 'published'
    order by effective_at desc limit 1;

    v_threshold := case when NEW.rate_type = 'open_market' then 2.0 else 1.0 end;

    select deviation_percent, is_anomalous, reason
    into v_deviation, v_anomalous, v_reason
    from evaluate_rate_deviation(v_previous, NEW.sell_rate, NEW.source_id, v_threshold);

    if v_anomalous then
        NEW.status := 'flagged_anomaly';
        NEW.reviewer_notes := coalesce(NEW.reviewer_notes || ' | ', '') || 'Auto-flagged: ' || v_reason;
    end if;

    perform record_rate_verification('currency', 'currency_rate_submissions', NEW.id, v_deviation, v_anomalous, v_reason, NEW.source_id);

    return NEW;
end;
$$;

create trigger trg_check_currency_rate_anomaly
    before insert on currency_rate_submissions
    for each row execute function check_currency_rate_anomaly();

-- ---------------------------------------------------------
-- Cement -- 6% threshold (Data Architecture, Section 9: "less
-- volatile day-to-day, so a smaller absolute move is more
-- suspicious" relative to gold, hence a lower % base than one
-- might expect, but still higher than gold/currency's own
-- thresholds -- values chosen were deliberate in the source
-- document and are reused verbatim here, not re-derived).
-- ---------------------------------------------------------
create or replace function check_cement_rate_anomaly()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_previous numeric;
    v_deviation numeric;
    v_anomalous boolean;
    v_reason text;
begin
    select price_per_bag into v_previous
    from cement_rates
    where brand_id = NEW.brand_id and city_id = NEW.city_id and status = 'published'
    order by effective_at desc limit 1;

    select deviation_percent, is_anomalous, reason
    into v_deviation, v_anomalous, v_reason
    from evaluate_rate_deviation(v_previous, NEW.price_per_bag, NEW.source_id, 6.0);

    if v_anomalous then
        NEW.status := 'flagged_anomaly';
        NEW.reviewer_notes := coalesce(NEW.reviewer_notes || ' | ', '') || 'Auto-flagged: ' || v_reason;
    end if;

    perform record_rate_verification('cement', 'cement_rate_submissions', NEW.id, v_deviation, v_anomalous, v_reason, NEW.source_id);

    return NEW;
end;
$$;

create trigger trg_check_cement_rate_anomaly
    before insert on cement_rate_submissions
    for each row execute function check_cement_rate_anomaly();

-- ---------------------------------------------------------
-- Steel -- 6% threshold, checked against price_per_ton only.
-- price_per_maund is intentionally not checked separately: the
-- two figures move in fixed proportion to one another (1 ton =
-- 40 maunds by definition), so a second independent deviation
-- check on the same underlying price would be redundant, not
-- additional signal.
-- ---------------------------------------------------------
create or replace function check_steel_rate_anomaly()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_previous numeric;
    v_deviation numeric;
    v_anomalous boolean;
    v_reason text;
begin
    select price_per_ton into v_previous
    from steel_rates
    where grade_id = NEW.grade_id and city_id = NEW.city_id and status = 'published'
    order by effective_at desc limit 1;

    select deviation_percent, is_anomalous, reason
    into v_deviation, v_anomalous, v_reason
    from evaluate_rate_deviation(v_previous, NEW.price_per_ton, NEW.source_id, 6.0);

    if v_anomalous then
        NEW.status := 'flagged_anomaly';
        NEW.reviewer_notes := coalesce(NEW.reviewer_notes || ' | ', '') || 'Auto-flagged: ' || v_reason;
    end if;

    perform record_rate_verification('steel', 'steel_rate_submissions', NEW.id, v_deviation, v_anomalous, v_reason, NEW.source_id);

    return NEW;
end;
$$;

create trigger trg_check_steel_rate_anomaly
    before insert on steel_rate_submissions
    for each row execute function check_steel_rate_anomaly();
