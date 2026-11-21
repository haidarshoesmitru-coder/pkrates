-- Fix: evaluate_rate_deviation used format('%.2f') which PostgreSQL's
-- format() does not support (only %s/%I/%L). Any submission whose
-- deviation exceeded the anomaly threshold (e.g. silver 4200 -> 4600,
-- +9.5%) failed with: unrecognized format() type specifier "."
-- Same function as 20260719091400, only the format() call is fixed.

create or replace function evaluate_rate_deviation(
    p_previous_value numeric,
    p_proposed_value numeric,
    p_source_id uuid,
    p_domain_threshold_pct numeric
) returns table (deviation_percent numeric, is_anomalous boolean, reason text)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_deviation numeric;
    v_tier smallint;
    v_effective_threshold numeric;
begin
    select reliability_tier into v_tier from sources where id = p_source_id;

    if p_previous_value is null or p_previous_value = 0 then
        return query select 0::numeric, false, 'no_prior_value_to_compare'::text;
        return;
    end if;

    v_deviation := round(abs(p_proposed_value - p_previous_value) / p_previous_value * 100, 3);

    v_effective_threshold := p_domain_threshold_pct * case
        when v_tier <= 2 then 1.25
        when v_tier = 3 then 1.0
        else 0.6
    end;

    if v_deviation > v_effective_threshold then
        return query select
            v_deviation,
            true,
            format(
                'Deviation %s%% exceeds the effective threshold %s%% (domain base %s%%, source reliability tier %s).',
                round(v_deviation, 2), round(v_effective_threshold, 2), round(p_domain_threshold_pct, 2), coalesce(v_tier::text, 'unknown')
            );
    else
        return query select v_deviation, false, null::text;
    end if;
end;
$$;
