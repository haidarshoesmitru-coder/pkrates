-- =========================================================
-- 003_gold.sql
-- Gold Rates: city-wise, karat-wise, manual_reviewed ingestion.
-- =========================================================

create table gold_karats (
    id smallint primary key generated always as identity,
    label text unique not null,
    purity_fraction numeric(5,4) not null
);

-- ---------------------------------------------------------
-- Published ledger (append-only)
-- ---------------------------------------------------------
create table gold_rates (
    id uuid primary key default uuid_generate_v4(),
    city_id smallint not null references cities(id),
    karat_id smallint not null references gold_karats(id),
    rate_per_tola numeric(14,2) not null check (rate_per_tola > 0),
    rate_per_10g numeric(14,2) not null check (rate_per_10g > 0),
    rate_per_gram numeric(14,2) not null check (rate_per_gram > 0),
    source_id uuid not null references sources(id),
    status text not null default 'published' check (status in ('published','corrected','void')),
    corrected_from_id uuid references gold_rates(id),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    effective_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint chk_gold_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_gold_rates_lookup on gold_rates (city_id, karat_id, effective_at desc);
create index idx_gold_rates_status on gold_rates (status) where status = 'published';
create index idx_gold_rates_source on gold_rates (source_id);

-- ---------------------------------------------------------
-- Submission / staging table
-- ---------------------------------------------------------
create table gold_rate_submissions (
    id uuid primary key default uuid_generate_v4(),
    city_id smallint not null references cities(id),
    karat_id smallint not null references gold_karats(id),
    rate_per_tola numeric(14,2) not null check (rate_per_tola > 0),
    source_id uuid not null references sources(id),
    correcting_rate_id uuid references gold_rates(id),
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_gold_sub_reviewer_not_submitter check (reviewed_by is distinct from submitted_by),
    constraint chk_gold_sub_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_gold_submissions_pending on gold_rate_submissions (city_id, karat_id) where status = 'pending';
create index idx_gold_submissions_status on gold_rate_submissions (status);
