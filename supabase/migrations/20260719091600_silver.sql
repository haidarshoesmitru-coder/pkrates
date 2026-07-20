-- =========================================================
-- 20260719091600_silver.sql
-- PKRates v1.7 — Silver (Chandi) Rates.
--
-- ARCHITECTURAL NOTE: this file is a direct structural mirror of
-- 20260719090200_gold.sql. Same three-table shape (reference
-- table -> fact ledger -> submissions staging), same column
-- names and constraints, same index naming convention. The only
-- domain-specific difference is `purity` in place of `karat` —
-- silver in the Pakistani market is quoted by fineness (999 fine
-- / 925 sterling) rather than karat, so the reference table is
-- named accordingly, but its shape (id, label, purity_fraction)
-- is identical to gold_karats. No new architectural pattern is
-- introduced here.
-- =========================================================

create table silver_purities (
    id smallint primary key generated always as identity,
    label text unique not null,
    purity_fraction numeric(5,4) not null
);

-- ---------------------------------------------------------
-- Published ledger (append-only) -- identical shape to gold_rates
-- ---------------------------------------------------------
create table silver_rates (
    id uuid primary key default uuid_generate_v4(),
    city_id smallint not null references cities(id),
    purity_id smallint not null references silver_purities(id),
    rate_per_tola numeric(14,2) not null check (rate_per_tola > 0),
    rate_per_10g numeric(14,2) not null check (rate_per_10g > 0),
    rate_per_gram numeric(14,2) not null check (rate_per_gram > 0),
    source_id uuid not null references sources(id),
    status text not null default 'published' check (status in ('published','corrected','void')),
    corrected_from_id uuid references silver_rates(id),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    effective_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint chk_silver_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_silver_rates_lookup on silver_rates (city_id, purity_id, effective_at desc);
create index idx_silver_rates_status on silver_rates (status) where status = 'published';
create index idx_silver_rates_source on silver_rates (source_id);

-- ---------------------------------------------------------
-- Submission / staging table -- identical shape to gold_rate_submissions
-- ---------------------------------------------------------
create table silver_rate_submissions (
    id uuid primary key default uuid_generate_v4(),
    city_id smallint not null references cities(id),
    purity_id smallint not null references silver_purities(id),
    rate_per_tola numeric(14,2) not null check (rate_per_tola > 0),
    source_id uuid not null references sources(id),
    correcting_rate_id uuid references silver_rates(id),
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_silver_sub_reviewer_not_submitter check (reviewed_by is distinct from submitted_by),
    constraint chk_silver_sub_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_silver_submissions_pending on silver_rate_submissions (city_id, purity_id) where status = 'pending';
create index idx_silver_submissions_status on silver_rate_submissions (status);
