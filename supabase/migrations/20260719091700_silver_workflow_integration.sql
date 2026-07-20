-- =========================================================
-- 20260719091700_silver_workflow_integration.sql
-- PKRates v1.7 — wires Silver into every existing cross-cutting
-- system: the materialized-view read layer, the scheduled
-- refresh architecture (v1.5), the publish-notify trigger, the
-- approval/promotion workflow, the anomaly detection system
-- (v1.5), and RLS. Every function touched here already existed;
-- each is patched via `create or replace function` (the same
-- additive-migration pattern used throughout v1.5) to add one
-- more domain to an existing whitelist/mapping/branch. No
-- function is duplicated, no new pattern is introduced.
-- =========================================================

-- ---------------------------------------------------------
-- 0. user_domain_access.domain is the one closed enum in the
-- schema that lists all 7 domains by name (migration 001) --
-- reviewed the whole schema before writing this file, and this
-- is the only CHECK constraint of its kind. Postgres has no
-- ALTER CONSTRAINT, so it must be dropped and recreated with
-- 'silver' added. Rather than hardcode the constraint's
-- auto-generated name (a naming-convention assumption that would
-- hard-fail this migration if wrong), it's looked up from the
-- catalog at migration time.
-- ---------------------------------------------------------
do $$
declare
    v_constraint_name text;
begin
    select con.conname into v_constraint_name
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'user_domain_access'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%domain%';

    if v_constraint_name is not null then
        execute format('alter table user_domain_access drop constraint %I', v_constraint_name);
    end if;

    alter table user_domain_access add constraint user_domain_access_domain_check check (domain in
        ('gold','silver','currency','petrol','crypto','prize_bonds','cement','steel'));
end;
$$;

-- ---------------------------------------------------------
-- 1. Current-value materialized view -- identical shape/pattern
-- to current_gold_rates (migration 010).
-- ---------------------------------------------------------
create materialized view current_silver_rates as
select distinct on (city_id, purity_id)
    id, city_id, purity_id, rate_per_tola, rate_per_10g, rate_per_gram, effective_at, source_id
from silver_rates
where status = 'published'
order by city_id, purity_id, effective_at desc;
create unique index idx_current_silver_rates on current_silver_rates (city_id, purity_id);

-- ---------------------------------------------------------
-- 2. Scheduled refresh (v1.5) -- add Silver to the two existing
-- whitelist/batch functions rather than creating parallel ones.
-- ---------------------------------------------------------
create or replace function refresh_current_rate_view(view_name text)
returns void
language plpgsql
as $$
begin
    if view_name not in (
        'current_gold_rates', 'current_silver_rates', 'current_currency_rates', 'current_fuel_prices',
        'current_crypto_rates', 'current_cement_rates', 'current_steel_rates'
    ) then
        raise exception 'Unknown or disallowed view: %', view_name;
    end if;
    execute format('refresh materialized view concurrently %I', view_name);
end;
$$;

create or replace function refresh_all_current_rate_views_safe(triggered_by text default 'cron')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    perform refresh_current_rate_view_safe('current_gold_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_silver_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_currency_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_fuel_prices', triggered_by);
    perform refresh_current_rate_view_safe('current_cement_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_steel_rates', triggered_by);
end;
$$;
-- No change needed to the pg_cron schedule itself
-- ('pkrates-refresh-other-views') -- it already calls this batch
-- function by name, so Silver is now included on the existing
-- 3-minute cadence automatically.

-- ---------------------------------------------------------
-- 3. Publish notification (v1.3/v1.5) -- add the one missing
-- CASE branch to the existing generic trigger function, and
-- attach it to silver_rates the same way every other fact table
-- already uses it.
-- ---------------------------------------------------------
create or replace function notify_rate_published()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    view_name text;
    new_json jsonb;
begin
    view_name := case TG_TABLE_NAME
        when 'gold_rates' then 'current_gold_rates'
        when 'silver_rates' then 'current_silver_rates'
        when 'currency_rates' then 'current_currency_rates'
        when 'fuel_prices' then 'current_fuel_prices'
        when 'crypto_rates' then 'current_crypto_rates'
        when 'cement_rates' then 'current_cement_rates'
        when 'steel_rates' then 'current_steel_rates'
    end;
    new_json := to_jsonb(NEW);
    perform pg_notify('pkrates_rate_published', json_build_object(
        'table', TG_TABLE_NAME,
        'view', view_name,
        'id', NEW.id,
        'effective_at', coalesce(new_json->>'effective_at', new_json->>'effective_from')
    )::text);
    return NEW;
end;
$$;

create trigger trg_notify_silver_published
    after insert on silver_rates for each row execute function notify_rate_published();

-- ---------------------------------------------------------
-- 4. Approval / promotion trigger -- identical to
-- promote_gold_submission() (migration 011, patched in
-- migration 20260719091500 for flagged_anomaly support). Silver
-- is written from scratch already including that fix -- no
-- separate patch migration needed for it, unlike Gold which
-- predated the anomaly system.
-- ---------------------------------------------------------
create or replace function promote_silver_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_fact_id uuid;
    grams_per_tola constant numeric := 11.6638038;
begin
    if NEW.status = 'approved' and OLD.status in ('pending', 'flagged_anomaly') then
        insert into silver_rates (
            city_id, purity_id, rate_per_tola, rate_per_10g, rate_per_gram,
            source_id, submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.city_id, NEW.purity_id, NEW.rate_per_tola,
            round((NEW.rate_per_tola / grams_per_tola) * 10, 2),
            round(NEW.rate_per_tola / grams_per_tola, 2),
            NEW.source_id, NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update silver_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('silver', to_jsonb(NEW) || jsonb_build_object('__table__','silver_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status in ('pending', 'flagged_anomaly') then
        perform log_submission_review('silver', to_jsonb(NEW) || jsonb_build_object('__table__','silver_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_silver_submission
    after update on silver_rate_submissions
    for each row execute function promote_silver_submission();

-- ---------------------------------------------------------
-- 5. Anomaly detection (v1.5) -- identical pattern to
-- check_gold_rate_anomaly(), reusing evaluate_rate_deviation()
-- and record_rate_verification() unchanged. Same 4% base
-- threshold as Gold: both are precious metals priced per tola
-- with comparable day-to-day volatility, so the Data
-- Architecture's gold threshold is the correct one to reuse
-- rather than inventing a new number for silver specifically.
-- ---------------------------------------------------------
create or replace function check_silver_rate_anomaly()
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
    from silver_rates
    where city_id = NEW.city_id and purity_id = NEW.purity_id and status = 'published'
    order by effective_at desc limit 1;

    select deviation_percent, is_anomalous, reason
    into v_deviation, v_anomalous, v_reason
    from evaluate_rate_deviation(v_previous, NEW.rate_per_tola, NEW.source_id, 4.0);

    if v_anomalous then
        NEW.status := 'flagged_anomaly';
        NEW.reviewer_notes := coalesce(NEW.reviewer_notes || ' | ', '') || 'Auto-flagged: ' || v_reason;
    end if;

    perform record_rate_verification('silver', 'silver_rate_submissions', NEW.id, v_deviation, v_anomalous, v_reason, NEW.source_id);

    return NEW;
end;
$$;

create trigger trg_check_silver_rate_anomaly
    before insert on silver_rate_submissions
    for each row execute function check_silver_rate_anomaly();

-- ---------------------------------------------------------
-- 6. RLS -- identical policy pattern to gold_karats/gold_rates/
-- gold_rate_submissions (migration 012), including the
-- flagged_anomaly-aware reviewer UPDATE condition that Gold
-- needed a separate patch migration to receive (20260719091500).
-- ---------------------------------------------------------
alter table silver_purities enable row level security;
alter table silver_rates enable row level security;
alter table silver_rate_submissions enable row level security;

create policy "reference data is publicly readable" on silver_purities for select using (true);
create policy "admins manage silver_purities" on silver_purities for all
    using (is_admin_or_above()) with check (is_admin_or_above());

create policy "published silver rates are public" on silver_rates for select
    using (status = 'published' or is_admin_or_above() or can_review('silver'));

create policy "editors submit silver" on silver_rate_submissions for insert
    with check (can_edit('silver') and submitted_by = current_app_user_id());
create policy "domain staff read silver submissions" on silver_rate_submissions for select
    using (can_edit('silver') or is_admin_or_above());
create policy "reviewers decide silver submissions" on silver_rate_submissions for update
    using (can_review('silver') and status in ('pending', 'flagged_anomaly'))
    with check (reviewed_by = current_app_user_id());
