-- =========================================================
-- 008_cement.sql
-- Cement Rates: per-bag, brand x city, manual_reviewed via
-- dealer/distributor networks.
-- =========================================================

create table cement_brands (
    id smallint primary key generated always as identity,
    name text unique not null
);

create table cement_rates (
    id uuid primary key default gen_random_uuid(),
    brand_id smallint not null references cement_brands(id),
    city_id smallint not null references cities(id),
    price_per_bag numeric(14,2) not null check (price_per_bag > 0),
    source_id uuid not null references sources(id),
    status text not null default 'published' check (status in ('published','corrected','void')),
    corrected_from_id uuid references cement_rates(id),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    effective_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint chk_cement_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_cement_rates_lookup on cement_rates (brand_id, city_id, effective_at desc);
create index idx_cement_rates_status on cement_rates (status) where status = 'published';

create table cement_rate_submissions (
    id uuid primary key default gen_random_uuid(),
    brand_id smallint not null references cement_brands(id),
    city_id smallint not null references cities(id),
    price_per_bag numeric(14,2) not null check (price_per_bag > 0),
    source_id uuid not null references sources(id),
    correcting_rate_id uuid references cement_rates(id),
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_cement_sub_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_cement_submissions_pending on cement_rate_submissions (brand_id, city_id) where status = 'pending';
