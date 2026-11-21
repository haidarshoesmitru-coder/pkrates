-- =========================================================
-- 20260719091500_flagged_anomaly_review_patch.sql
-- PKRates v1.5 — companion fix required by Requirement 2's
-- "Allow admin Approve/Reject actions."
--
-- WHY THIS MIGRATION EXISTS: reviewing the existing code before
-- writing anomaly detection surfaced a real gap. Every
-- promote_<domain>_submission() trigger function (migration 011)
-- only fires promotion/rejection logic when
-- `OLD.status = 'pending'`. Every submission-table UPDATE policy
-- (migration 012) only permits a reviewer to target a row when
-- `status = 'pending'`. Before this release, nothing ever set a
-- submission's status to 'flagged_anomaly' automatically (it only
-- ever appeared in hand-written mock data), so this gap was
-- invisible. Now that 20260719091400_anomaly_detection.sql can
-- set that status for real, a flagged submission would have been
-- silently unapprovable and unrejectable -- visible in the admin
-- queue, but every action on it would fail RLS or simply no-op.
--
-- This migration does not change any table, any column, or any
-- business rule -- it widens two existing conditions
-- ('pending' -> 'pending' or 'flagged_anomaly') so the workflow
-- that already existed for ordinary submissions also covers
-- flagged ones, which is what "allow admin approve/reject" on
-- anomalies actually requires. Functions are patched via
-- `create or replace function` (migrations are additive; the
-- original migration 011 file is untouched). Policies cannot be
-- altered in place in Postgres, so each is dropped and recreated
-- with the corrected condition.
-- =========================================================

-- ---------------------------------------------------------
-- 1. Promotion triggers -- widen OLD.status check
-- ---------------------------------------------------------

create or replace function promote_gold_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status in ('pending', 'flagged_anomaly') then
        insert into gold_rates (
            city_id, karat_id, rate_per_tola, rate_per_10g, rate_per_gram,
            source_id, submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.city_id, NEW.karat_id, NEW.rate_per_tola,
            round((NEW.rate_per_tola / 11.6638038) * 10, 2),
            round(NEW.rate_per_tola / 11.6638038, 2),
            NEW.source_id, NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update gold_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('gold', to_jsonb(NEW) || jsonb_build_object('__table__','gold_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status in ('pending', 'flagged_anomaly') then
        perform log_submission_review('gold', to_jsonb(NEW) || jsonb_build_object('__table__','gold_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create or replace function promote_currency_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status in ('pending', 'flagged_anomaly') then
        insert into currency_rates (
            currency_id, rate_type, buy_rate, sell_rate,
            source_id, submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.currency_id, NEW.rate_type, NEW.buy_rate, NEW.sell_rate,
            NEW.source_id, NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update currency_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('currency', to_jsonb(NEW) || jsonb_build_object('__table__','currency_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status in ('pending', 'flagged_anomaly') then
        perform log_submission_review('currency', to_jsonb(NEW) || jsonb_build_object('__table__','currency_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create or replace function promote_cement_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status in ('pending', 'flagged_anomaly') then
        insert into cement_rates (
            brand_id, city_id, price_per_bag, source_id,
            submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.brand_id, NEW.city_id, NEW.price_per_bag, NEW.source_id,
            NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update cement_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('cement', to_jsonb(NEW) || jsonb_build_object('__table__','cement_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status in ('pending', 'flagged_anomaly') then
        perform log_submission_review('cement', to_jsonb(NEW) || jsonb_build_object('__table__','cement_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create or replace function promote_steel_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status in ('pending', 'flagged_anomaly') then
        insert into steel_rates (
            grade_id, city_id, price_per_maund, price_per_ton, source_id,
            submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.grade_id, NEW.city_id, NEW.price_per_maund, NEW.price_per_ton, NEW.source_id,
            NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update steel_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('steel', to_jsonb(NEW) || jsonb_build_object('__table__','steel_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status in ('pending', 'flagged_anomaly') then
        perform log_submission_review('steel', to_jsonb(NEW) || jsonb_build_object('__table__','steel_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

-- Note: fuel_price_submissions and prize_bond_*_submissions promotion
-- functions are untouched -- Requirement 2's anomaly triggers do not
-- apply to those domains (see 20260719091400's scope note), so they
-- can never receive a 'flagged_anomaly' status and their existing
-- 'pending'-only condition remains correct as originally written.

-- ---------------------------------------------------------
-- 2. RLS policies -- widen the reviewable-status filter
-- ---------------------------------------------------------

drop policy if exists "reviewers decide gold submissions" on gold_rate_submissions;
create policy "reviewers decide gold submissions" on gold_rate_submissions for update
    using (can_review('gold') and status in ('pending', 'flagged_anomaly'))
    with check (reviewed_by = current_app_user_id());

drop policy if exists "reviewers decide currency submissions" on currency_rate_submissions;
create policy "reviewers decide currency submissions" on currency_rate_submissions for update
    using (can_review('currency') and status in ('pending', 'flagged_anomaly'))
    with check (reviewed_by = current_app_user_id());

drop policy if exists "reviewers decide cement submissions" on cement_rate_submissions;
create policy "reviewers decide cement submissions" on cement_rate_submissions for update
    using (can_review('cement') and status in ('pending', 'flagged_anomaly'))
    with check (reviewed_by = current_app_user_id());

drop policy if exists "reviewers decide steel submissions" on steel_rate_submissions;
create policy "reviewers decide steel submissions" on steel_rate_submissions for update
    using (can_review('steel') and status in ('pending', 'flagged_anomaly'))
    with check (reviewed_by = current_app_user_id());

-- Petrol and Prize Bond submission UPDATE policies are intentionally
-- left as 'pending'-only, for the same reason their promotion
-- functions above are untouched: those domains are out of this
-- anomaly system's scope, so they can never reach 'flagged_anomaly'.
