-- =========================================================
-- 010_materialized_views.sql
-- Current-value read layer. The public app reads exclusively
-- from these views — never from the fact tables directly.
-- =========================================================

create materialized view current_gold_rates as
select distinct on (city_id, karat_id)
    id, city_id, karat_id, rate_per_tola, rate_per_10g, rate_per_gram, effective_at, source_id
from gold_rates
where status = 'published'
order by city_id, karat_id, effective_at desc;
create unique index idx_current_gold_rates on current_gold_rates (city_id, karat_id);

create materialized view current_currency_rates as
select distinct on (currency_id, rate_type)
    id, currency_id, rate_type, buy_rate, sell_rate, effective_at, source_id
from currency_rates
where status = 'published'
order by currency_id, rate_type, effective_at desc;
create unique index idx_current_currency_rates on current_currency_rates (currency_id, rate_type);

create materialized view current_fuel_prices as
select distinct on (fuel_type_id)
    id, fuel_type_id, price_per_liter, change_amount, effective_from, notification_reference, source_id
from fuel_prices
where status = 'published'
  and (effective_to is null or effective_to > now())
order by fuel_type_id, effective_from desc;
create unique index idx_current_fuel_prices on current_fuel_prices (fuel_type_id);

create materialized view current_crypto_rates as
select distinct on (coin_id)
    id, coin_id, price_usd, price_pkr, usd_pkr_rate_used, effective_at, source_id
from crypto_rates
order by coin_id, effective_at desc;
create unique index idx_current_crypto_rates on current_crypto_rates (coin_id);

create materialized view current_cement_rates as
select distinct on (brand_id, city_id)
    id, brand_id, city_id, price_per_bag, effective_at, source_id
from cement_rates
where status = 'published'
order by brand_id, city_id, effective_at desc;
create unique index idx_current_cement_rates on current_cement_rates (brand_id, city_id);

create materialized view current_steel_rates as
select distinct on (grade_id, city_id)
    id, grade_id, city_id, price_per_maund, price_per_ton, effective_at, source_id
from steel_rates
where status = 'published'
order by grade_id, city_id, effective_at desc;
create unique index idx_current_steel_rates on current_steel_rates (grade_id, city_id);

-- Prize Bonds has no "current value" concept (event-sourced,
-- not a point-in-time rate) — the upcoming-draw calendar is
-- served directly from prize_bond_draws, no view needed.

-- ---------------------------------------------------------
-- Refresh function. Safe to call concurrently (all views
-- above have a unique index, a requirement for CONCURRENTLY).
-- Invoked by: (a) the NOTIFY-driven listener for near-instant
-- refresh after a publish event (011_functions_and_triggers.sql),
-- and (b) a scheduled Edge Function every few minutes as a
-- fallback safety net per the caching strategy's staleness cap.
-- ---------------------------------------------------------
create or replace function refresh_all_current_rate_views()
returns void
language plpgsql
as $$
begin
    refresh materialized view concurrently current_gold_rates;
    refresh materialized view concurrently current_currency_rates;
    refresh materialized view concurrently current_fuel_prices;
    refresh materialized view concurrently current_crypto_rates;
    refresh materialized view concurrently current_cement_rates;
    refresh materialized view concurrently current_steel_rates;
end;
$$;

create or replace function refresh_current_rate_view(view_name text)
returns void
language plpgsql
as $$
begin
    if view_name not in (
        'current_gold_rates', 'current_currency_rates', 'current_fuel_prices',
        'current_crypto_rates', 'current_cement_rates', 'current_steel_rates'
    ) then
        raise exception 'Unknown or disallowed view: %', view_name;
    end if;
    execute format('refresh materialized view concurrently %I', view_name);
end;
$$;
