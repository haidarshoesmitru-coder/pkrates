-- =========================================================
-- 006_crypto.sql
-- Crypto Prices: fully automated (api_auto), no human review
-- gate and therefore no submissions/staging table — ingestion
-- agents write directly to the fact table under service-role
-- policy (see 012_rls_policies.sql).
-- =========================================================

create table crypto_coins (
    id smallint primary key generated always as identity,
    symbol text unique not null,
    name text not null,
    rank smallint
);

create table crypto_rates (
    id uuid primary key default gen_random_uuid(),
    coin_id smallint not null references crypto_coins(id),
    price_usd numeric(18,6) not null check (price_usd > 0),
    usd_pkr_rate_used numeric(14,4) not null check (usd_pkr_rate_used > 0),
    price_pkr numeric(18,2) not null check (price_pkr > 0),
    source_id uuid not null references sources(id),
    effective_at timestamptz not null default now(),
    created_at timestamptz not null default now()
);

create index idx_crypto_rates_lookup on crypto_rates (coin_id, effective_at desc);
create index idx_crypto_rates_source on crypto_rates (source_id);
