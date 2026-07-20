-- =========================================================
-- 009_steel.sql
-- Steel / Saria Rates: grade x city, manual_reviewed via
-- Steel Melters / Re-Rolling Mills Association networks.
-- =========================================================

create table steel_grades (
    id smallint primary key generated always as identity,
    label text unique not null
);

create table steel_rates (
    id uuid primary key default gen_random_uuid(),
    grade_id smallint not null references steel_grades(id),
    city_id smallint not null references cities(id),
    price_per_maund numeric(14,2) not null check (price_per_maund > 0),
    price_per_ton numeric(14,2) not null check (price_per_ton > 0),
    source_id uuid not null references sources(id),
    status text not null default 'published' check (status in ('published','corrected','void')),
    corrected_from_id uuid references steel_rates(id),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    effective_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint chk_steel_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_steel_rates_lookup on steel_rates (grade_id, city_id, effective_at desc);
create index idx_steel_rates_status on steel_rates (status) where status = 'published';

create table steel_rate_submissions (
    id uuid primary key default gen_random_uuid(),
    grade_id smallint not null references steel_grades(id),
    city_id smallint not null references cities(id),
    price_per_maund numeric(14,2) not null check (price_per_maund > 0),
    price_per_ton numeric(14,2) not null check (price_per_ton > 0),
    source_id uuid not null references sources(id),
    correcting_rate_id uuid references steel_rates(id),
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_steel_sub_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_steel_submissions_pending on steel_rate_submissions (grade_id, city_id) where status = 'pending';
