-- =========================================================
-- 005_petrol.sql
-- Petrol/Fuel Prices: event-sourced, OGRA-notification driven,
-- manual_fasttrack ingestion (official source, expedited review).
-- =========================================================

create table fuel_types (
    id smallint primary key generated always as identity,
    name text unique not null
);

create table fuel_prices (
    id uuid primary key default gen_random_uuid(),
    fuel_type_id smallint not null references fuel_types(id),
    price_per_liter numeric(14,2) not null check (price_per_liter > 0),
    previous_price numeric(14,2),
    change_amount numeric(14,2) generated always as
        (price_per_liter - coalesce(previous_price, price_per_liter)) stored,
    notification_reference text not null check (length(trim(notification_reference)) > 0),
    source_id uuid not null references sources(id),
    effective_from timestamptz not null,
    effective_to timestamptz,
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    status text not null default 'published' check (status in ('published','corrected','void')),
    created_at timestamptz not null default now(),
    constraint chk_fuel_approver_not_submitter check (approved_by is distinct from submitted_by),
    constraint chk_fuel_validity_window check (effective_to is null or effective_to > effective_from)
);

create index idx_fuel_prices_lookup on fuel_prices (fuel_type_id, effective_from desc);
create index idx_fuel_prices_status on fuel_prices (status) where status = 'published';

create table fuel_price_submissions (
    id uuid primary key default gen_random_uuid(),
    fuel_type_id smallint not null references fuel_types(id),
    price_per_liter numeric(14,2) not null check (price_per_liter > 0),
    notification_reference text not null check (length(trim(notification_reference)) > 0),
    effective_from timestamptz not null,
    source_id uuid not null references sources(id),
    submitted_by uuid references users(id),
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_fuel_sub_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_fuel_submissions_pending on fuel_price_submissions (fuel_type_id) where status = 'pending';
