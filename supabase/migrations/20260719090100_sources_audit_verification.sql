-- =========================================================
-- 002_sources_audit_verification.sql
-- Source registry, source health monitoring, the immutable
-- audit log, and the rate-verification log.
-- =========================================================

-- ---------------------------------------------------------
-- Sources
-- ---------------------------------------------------------
create table sources (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    type text not null check (type in
        ('official','association','exchange_api','dealer_network','manual_field_team')),
    domains text[] not null,
    reliability_tier smallint not null default 3 check (reliability_tier between 1 and 5),
    ingestion_mode text not null default 'manual_reviewed' check (ingestion_mode in
        ('api_auto','api_reviewed','manual_fasttrack','manual_reviewed')),
    contact_info text,
    is_active boolean not null default true,
    onboarded_at timestamptz not null default now(),
    deactivated_at timestamptz,
    constraint chk_sources_deactivated_consistency check (
        (is_active = true and deactivated_at is null) or
        (is_active = false and deactivated_at is not null)
    )
);

create index idx_sources_domains on sources using gin (domains);
create index idx_sources_active on sources (is_active) where is_active = true;

-- New sources are never onboarded pre-trusted — enforced here,
-- not just documented, per the Source Management System design.
create or replace function enforce_source_onboarding_trust()
returns trigger
language plpgsql
as $$
begin
    if TG_OP = 'INSERT' then
        if new.ingestion_mode = 'api_auto' then
            raise exception 'New sources cannot be onboarded directly as api_auto — promote via an explicit update after a trust track record.';
        end if;
        if new.reliability_tier < 3 then
            raise exception 'New sources cannot be onboarded above reliability tier 3 — promote deliberately after a track record.';
        end if;
    end if;
    return new;
end;
$$;

create trigger trg_sources_onboarding_trust
before insert on sources
for each row execute function enforce_source_onboarding_trust();

-- ---------------------------------------------------------
-- Source health checks
-- ---------------------------------------------------------
create table source_health_checks (
    id bigint primary key generated always as identity,
    source_id uuid not null references sources(id) on delete cascade,
    checked_at timestamptz not null default now(),
    status text not null check (status in ('ok','degraded','unreachable','stale')),
    latency_ms integer,
    notes text
);

create index idx_source_health_checks_source_time on source_health_checks (source_id, checked_at desc);

-- ---------------------------------------------------------
-- Audit log — append-only. No UPDATE/DELETE grants exist for
-- any application role; see 012_rls_policies.sql.
-- ---------------------------------------------------------
create table audit_logs (
    id bigint primary key generated always as identity,
    entity_table text not null,
    entity_id uuid not null,
    domain text,
    action text not null check (action in
        ('insert','approve','reject','correct','verify','auto_publish','update','deactivate')),
    old_value jsonb,
    new_value jsonb,
    performed_by uuid references users(id),
    performed_by_system text,
    performed_at timestamptz not null default now(),
    notes text
);

create index idx_audit_logs_entity on audit_logs (entity_table, entity_id);
create index idx_audit_logs_domain_time on audit_logs (domain, performed_at desc);
create index idx_audit_logs_performed_by on audit_logs (performed_by);

-- ---------------------------------------------------------
-- Rate verification log
-- ---------------------------------------------------------
create table rate_verifications (
    id uuid primary key default gen_random_uuid(),
    domain text not null,
    submission_table text not null,
    submission_id uuid not null,
    method text not null check (method in
        ('single_source','multi_source_corroboration','deviation_check','cross_reference_api')),
    corroborating_source_ids uuid[],
    agreement_score numeric(5,2),
    deviation_percent numeric(6,3),
    verified boolean not null default false,
    checked_at timestamptz not null default now()
);

create index idx_rate_verifications_submission on rate_verifications (submission_table, submission_id);
create index idx_rate_verifications_domain_time on rate_verifications (domain, checked_at desc);
