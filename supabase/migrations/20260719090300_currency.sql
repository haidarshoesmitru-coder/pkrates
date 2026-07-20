-- =========================================================
-- 004_currency.sql
-- Currency Rates: interbank (api_reviewed) + open market
-- (manual_reviewed), buy/sell pairs.
-- =========================================================

create table currencies (
    id smallint primary key generated always as identity,
    code text unique not null,
    name text not null,
    symbol text
);

create table currency_rates (
    id uuid primary key default gen_random_uuid(),
    currency_id smallint not null references currencies(id),
    rate_type text not null check (rate_type in ('interbank','open_market')),
    buy_rate numeric(14,4) not null check (buy_rate > 0),
    sell_rate numeric(14,4) not null check (sell_rate > 0),
    source_id uuid not null references sources(id),
    status text not null default 'published' check (status in ('published','corrected','void')),
    corrected_from_id uuid references currency_rates(id),
    submitted_by uuid references users(id),
    approved_by uuid references users(id),
    effective_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint chk_currency_sell_gte_buy check (sell_rate >= buy_rate),
    constraint chk_currency_approver_not_submitter check (approved_by is distinct from submitted_by)
);

create index idx_currency_rates_lookup on currency_rates (currency_id, rate_type, effective_at desc);
create index idx_currency_rates_status on currency_rates (status) where status = 'published';

create table currency_rate_submissions (
    id uuid primary key default gen_random_uuid(),
    currency_id smallint not null references currencies(id),
    rate_type text not null check (rate_type in ('interbank','open_market')),
    buy_rate numeric(14,4) not null check (buy_rate > 0),
    sell_rate numeric(14,4) not null check (sell_rate > 0),
    source_id uuid not null references sources(id),
    correcting_rate_id uuid references currency_rates(id),
    submitted_by uuid references users(id),      -- null when submitted by an ingestion agent
    status text not null default 'pending' check (status in
        ('pending','approved','rejected','flagged_anomaly')),
    reviewer_notes text,
    reviewed_by uuid references users(id),
    reviewed_at timestamptz,
    submitted_at timestamptz not null default now(),
    constraint chk_currency_sub_sell_gte_buy check (sell_rate >= buy_rate),
    constraint chk_currency_sub_reject_requires_notes check (
        status <> 'rejected' or (reviewer_notes is not null and length(trim(reviewer_notes)) > 0)
    )
);

create index idx_currency_submissions_pending on currency_rate_submissions (currency_id, rate_type) where status = 'pending';
create index idx_currency_submissions_status on currency_rate_submissions (status);
