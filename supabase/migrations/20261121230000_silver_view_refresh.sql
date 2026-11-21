-- Fix: refresh_all_current_rate_views_safe never refreshed
-- current_silver_rates, so approved silver rates never appeared on
-- the public site. Add silver to the batch and refresh it now.

create or replace function refresh_all_current_rate_views_safe(triggered_by text default 'cron')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    perform refresh_current_rate_view_safe('current_gold_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_silver_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_currency_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_fuel_prices', triggered_by);
    perform refresh_current_rate_view_safe('current_cement_rates', triggered_by);
    perform refresh_current_rate_view_safe('current_steel_rates', triggered_by);
end;
$$;

select refresh_current_rate_view_safe('current_silver_rates', 'manual');
