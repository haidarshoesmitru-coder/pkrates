-- =========================================================
-- 20260719091300_scheduled_view_refresh.sql
-- PKRates v1.5 — Requirement 1: Scheduled materialized view
-- refresh architecture.
--
-- ARCHITECTURAL REVIEW FIRST (why this migration looks the way
-- it does): auditing 20260719091000_functions_and_triggers.sql,
-- notify_rate_published() — the only trigger that fires on the
-- fact tables — already does nothing but `perform pg_notify(...)`.
-- No trigger anywhere in the existing schema calls
-- `REFRESH MATERIALIZED VIEW`. That part of the brief is
-- therefore already satisfied by the existing design; what was
-- missing is that the refresh mechanism itself was only ever
-- described in a comment ("a listener process subscribes to
-- this channel...") and never actually implemented as a
-- deployable artifact. This migration replaces that comment
-- with a real, monitored, Supabase-native scheduled refresh —
-- pg_cron — plus the observability table needed to run it in
-- production with confidence. No existing trigger, table, or
-- function from prior migrations is removed; this is additive.
-- =========================================================

-- pg_cron ships as an available extension on Supabase-hosted
-- Postgres (enable via Database > Extensions if not already on).
create extension if not exists pg_cron;

-- ---------------------------------------------------------
-- Observability: every scheduled (or manually triggered) view
-- refresh gets logged here. Same append-only-log convention as
-- `source_health_checks` (migration 002) — reused deliberately
-- rather than inventing a new logging pattern.
-- ---------------------------------------------------------
create table view_refresh_log (
    id bigint primary key generated always as identity,
    view_name text not null,
    triggered_by text not null check (triggered_by in ('cron', 'edge_function', 'manual')),
    status text not null check (status in ('success', 'failed')),
    duration_ms integer,
    error_message text,
    refreshed_at timestamptz not null default now()
);

create index idx_view_refresh_log_view_time on view_refresh_log (view_name, refreshed_at desc);

-- Admin/Analyst read access — reuses the same helper functions
-- as every other governance table in the schema.
alter table view_refresh_log enable row level security;
create policy "admins and analysts read refresh log" on view_refresh_log for select
    using (is_admin_or_above() or has_role('analyst'));
-- No insert/update/delete policy for client roles — writes only
-- happen via the SECURITY DEFINER function below.

-- ---------------------------------------------------------
-- Safe, logged, single-view refresh. Wraps the existing
-- `refresh_current_rate_view()` from migration 010 (kept as-is,
-- still callable directly if ever needed) with exception
-- handling: a failure refreshing one view must never abort a
-- batch refresh of the other five, and every attempt — success
-- or failure — leaves a row in view_refresh_log for monitoring.
-- ---------------------------------------------------------
create or replace function refresh_current_rate_view_safe(view_name text, triggered_by text default 'cron')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_start timestamptz := clock_timestamp();
    -- Duration computed via extract(epoch from ...) rather than
    -- extract(milliseconds from ...): the latter only returns the
    -- sub-minute remainder of an interval and would under-report
    -- any refresh that happens to take over 60 seconds.
begin
    perform refresh_current_rate_view(view_name);   -- defined in migration 010; validates view_name itself

    insert into view_refresh_log (view_name, triggered_by, status, duration_ms)
    values (view_name, triggered_by, 'success', round(extract(epoch from (clock_timestamp() - v_start)) * 1000)::integer);
exception
    when others then
        insert into view_refresh_log (view_name, triggered_by, status, duration_ms, error_message)
        values (view_name, triggered_by, 'failed', round(extract(epoch from (clock_timestamp() - v_start)) * 1000)::integer, SQLERRM);
        -- Deliberately swallowed, not re-raised: one view's refresh
        -- failure must not abort the cron job's remaining views, and
        -- the public site keeps serving the last-good view content
        -- regardless (stale-but-correct beats a broken refresh job).
end;
$$;

-- Batch wrapper used by the cron jobs below — each view refreshed
-- and logged independently via the safe function above.
create or replace function refresh_all_current_rate_views_safe(triggered_by text default 'cron')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    perform refresh_current_rate_view_safe('current_gold_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_currency_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_fuel_prices', triggered_by);
    perform refresh_current_rate_view_safe('current_cement_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_steel_rates', triggered_by);
end;
$$;

-- ---------------------------------------------------------
-- Scheduled jobs — differentiated cadence per domain, matching
-- each category's real-world update frequency from the approved
-- Data Architecture (Section 3), rather than one blanket
-- interval for everything:
--   - Crypto updates every 1-5 minutes at the source -> refresh
--     its view every minute, on its own job, so a slow refresh
--     of the five slower-moving domains never delays it.
--   - Gold/Currency/Cement/Steel move at most a handful of times
--     a day -> a shared 3-minute job is comfortably inside the
--     5-minute max-staleness cap set by the caching strategy
--     (see the SRS, Section 16) while avoiding unnecessary churn.
--   - Fuel prices are event-sourced (twice-monthly OGRA
--     notifications, see the Data Architecture) -> refreshing
--     every 3 minutes alongside the other slow domains is already
--     far more often than the data itself ever actually changes;
--     no dedicated faster job is warranted.
-- ---------------------------------------------------------
select cron.schedule(
    'pkrates-refresh-crypto-view',
    '* * * * *',                                    -- every minute
    $$select refresh_current_rate_view_safe('current_crypto_rates', 'cron')$$
);

select cron.schedule(
    'pkrates-refresh-other-views',
    '*/3 * * * *',                                   -- every 3 minutes
    $$select refresh_all_current_rate_views_safe('cron')$$
);

-- ---------------------------------------------------------
-- Event-driven complement (documented, not wired with secrets
-- in SQL): the existing notify_rate_published() trigger already
-- emits `pg_notify('pkrates_rate_published', ...)` on every fact
-- table insert. A Supabase Database Webhook (Dashboard > Database
-- > Webhooks — configured outside SQL, since it needs the
-- deployed Edge Function's URL and a service-role secret that do
-- not belong in a checked-in migration) can subscribe to INSERT
-- on gold_rates / currency_rates / fuel_prices / cement_rates /
-- steel_rates and call the `refresh-rate-views` Edge Function
-- (see supabase/functions/refresh-rate-views) for near-instant
-- refresh of just the affected view. The cron jobs above remain
-- the safety net regardless — if the webhook is never configured,
-- misfires, or the Edge Function is down, worst-case staleness is
-- still bounded at 1-3 minutes, not unbounded.
-- ---------------------------------------------------------
