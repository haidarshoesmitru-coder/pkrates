-- =========================================================
-- 011_functions_and_triggers.sql
-- The engine that turns "approve a submission" into an atomic
-- transaction: promote to the fact table, write the audit
-- log, and notify the cache-refresh listener — matching the
-- Admin Update Workflow described in the approved architecture.
-- =========================================================

-- ---------------------------------------------------------
-- 0. Segregation-of-duty: reviewer must never equal submitter,
-- enforced consistently across every submission table (gold's
-- was declared inline; the rest are added here for uniformity).
-- ---------------------------------------------------------
alter table currency_rate_submissions
    add constraint chk_currency_sub_reviewer_not_submitter check (
        reviewed_by is null or submitted_by is null or reviewed_by <> submitted_by
    );
alter table fuel_price_submissions
    add constraint chk_fuel_sub_reviewer_not_submitter check (reviewed_by is distinct from submitted_by);
alter table cement_rate_submissions
    add constraint chk_cement_sub_reviewer_not_submitter check (reviewed_by is distinct from submitted_by);
alter table steel_rate_submissions
    add constraint chk_steel_sub_reviewer_not_submitter check (reviewed_by is distinct from submitted_by);
alter table prize_bond_draw_submissions
    add constraint chk_pbds_reviewer_not_submitter check (reviewed_by is distinct from submitted_by);
alter table prize_bond_winner_submissions
    add constraint chk_pbws_reviewer_not_submitter check (reviewed_by is distinct from submitted_by);

-- ---------------------------------------------------------
-- 1. Generic audit logger for submission review decisions.
-- Fires on every domain's submissions table; the domain name
-- is bound at trigger-creation time via a wrapper per table
-- since Postgres trigger functions can't easily read TG_ARGV
-- in a fully generic way across differing schemas — each
-- wrapper below is a one-line pass-through for clarity.
-- ---------------------------------------------------------
create or replace function log_submission_review(domain_name text, row_data jsonb, old_data jsonb,
                                                    entity_id uuid, new_status text,
                                                    reviewer uuid, notes text)
returns void
language plpgsql
security definer
    set search_path = public
as $$
begin
    insert into audit_logs (entity_table, entity_id, domain, action, old_value, new_value, performed_by, notes)
    values (
        row_data->>'__table__',
        entity_id,
        domain_name,
        case new_status when 'approved' then 'approve' else 'reject' end,
        old_data,
        row_data,
        reviewer,
        notes
    );
end;
$$;

-- ---------------------------------------------------------
-- 2. Publish notifications — decouples materialized view
-- refresh from the publishing transaction itself (refreshing
-- CONCURRENTLY inside the same transaction that just wrote the
-- row risks unnecessary lock contention under concurrent
-- approvals). A listener process (Edge Function) subscribes to
-- this channel and calls refresh_current_rate_view(); the
-- scheduled fallback in 010 guarantees a five-minute worst case
-- even if a notification is ever missed.
-- ---------------------------------------------------------
create or replace function notify_rate_published()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    view_name text;
    new_json jsonb;
begin
    view_name := case TG_TABLE_NAME
        when 'gold_rates' then 'current_gold_rates'
        when 'currency_rates' then 'current_currency_rates'
        when 'fuel_prices' then 'current_fuel_prices'
        when 'crypto_rates' then 'current_crypto_rates'
        when 'cement_rates' then 'current_cement_rates'
        when 'steel_rates' then 'current_steel_rates'
    end;
    -- Go through jsonb rather than direct field access: gold/currency/
    -- cement/steel/crypto use `effective_at`, fuel_prices uses
    -- `effective_from` instead — direct NEW.<field> access would raise
    -- "record has no field" at runtime for whichever column that
    -- particular table lacks. The ->> operator returns null for a
    -- missing key instead of erroring.
    new_json := to_jsonb(NEW);
    perform pg_notify('pkrates_rate_published', json_build_object(
        'table', TG_TABLE_NAME,
        'view', view_name,
        'id', NEW.id,
        'effective_at', coalesce(new_json->>'effective_at', new_json->>'effective_from')
    )::text);
    return NEW;
end;
$$;

create trigger trg_notify_gold_published
    after insert on gold_rates for each row execute function notify_rate_published();
create trigger trg_notify_currency_published
    after insert on currency_rates for each row execute function notify_rate_published();
create trigger trg_notify_fuel_published
    after insert on fuel_prices for each row execute function notify_rate_published();
create trigger trg_notify_crypto_published
    after insert on crypto_rates for each row execute function notify_rate_published();
create trigger trg_notify_cement_published
    after insert on cement_rates for each row execute function notify_rate_published();
create trigger trg_notify_steel_published
    after insert on steel_rates for each row execute function notify_rate_published();

-- ---------------------------------------------------------
-- 3. Domain-specific approval-promotion triggers.
-- Each fires AFTER UPDATE on a submissions table, only on the
-- pending -> approved transition, and performs the entire
-- "insert into fact table + close out corrections + audit log"
-- sequence atomically within the same transaction as the
-- reviewer's approval UPDATE.
-- ---------------------------------------------------------

-- 3a. Gold
create or replace function promote_gold_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    new_fact_id uuid;
    grams_per_tola constant numeric := 11.6638038;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        insert into gold_rates (
            city_id, karat_id, rate_per_tola, rate_per_10g, rate_per_gram,
            source_id, submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.city_id, NEW.karat_id, NEW.rate_per_tola,
            round((NEW.rate_per_tola / grams_per_tola) * 10, 2),
            round(NEW.rate_per_tola / grams_per_tola, 2),
            NEW.source_id, NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update gold_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('gold', to_jsonb(NEW) || jsonb_build_object('__table__','gold_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('gold', to_jsonb(NEW) || jsonb_build_object('__table__','gold_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_gold_submission
    after update on gold_rate_submissions
    for each row execute function promote_gold_submission();

-- 3b. Currency
create or replace function promote_currency_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        insert into currency_rates (
            currency_id, rate_type, buy_rate, sell_rate,
            source_id, submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.currency_id, NEW.rate_type, NEW.buy_rate, NEW.sell_rate,
            NEW.source_id, NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update currency_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('currency', to_jsonb(NEW) || jsonb_build_object('__table__','currency_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('currency', to_jsonb(NEW) || jsonb_build_object('__table__','currency_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_currency_submission
    after update on currency_rate_submissions
    for each row execute function promote_currency_submission();

-- 3c. Petrol / Fuel — closes the previous validity window
create or replace function promote_fuel_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    new_fact_id uuid;
    prior_price numeric(14,2);
    prior_id uuid;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        select id, price_per_liter into prior_id, prior_price
        from fuel_prices
        where fuel_type_id = NEW.fuel_type_id and status = 'published' and effective_to is null
        order by effective_from desc limit 1;

        insert into fuel_prices (
            fuel_type_id, price_per_liter, previous_price, notification_reference,
            source_id, submitted_by, approved_by, effective_from
        ) values (
            NEW.fuel_type_id, NEW.price_per_liter, prior_price, NEW.notification_reference,
            NEW.source_id, NEW.submitted_by, NEW.reviewed_by, NEW.effective_from
        ) returning id into new_fact_id;

        if prior_id is not null then
            update fuel_prices set effective_to = NEW.effective_from where id = prior_id;
        end if;

        perform log_submission_review('petrol', to_jsonb(NEW) || jsonb_build_object('__table__','fuel_price_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('petrol', to_jsonb(NEW) || jsonb_build_object('__table__','fuel_price_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_fuel_submission
    after update on fuel_price_submissions
    for each row execute function promote_fuel_submission();

-- 3d. Cement
create or replace function promote_cement_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        insert into cement_rates (
            brand_id, city_id, price_per_bag, source_id,
            submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.brand_id, NEW.city_id, NEW.price_per_bag, NEW.source_id,
            NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update cement_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('cement', to_jsonb(NEW) || jsonb_build_object('__table__','cement_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('cement', to_jsonb(NEW) || jsonb_build_object('__table__','cement_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_cement_submission
    after update on cement_rate_submissions
    for each row execute function promote_cement_submission();

-- 3e. Steel
create or replace function promote_steel_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        insert into steel_rates (
            grade_id, city_id, price_per_maund, price_per_ton, source_id,
            submitted_by, approved_by, corrected_from_id, effective_at
        ) values (
            NEW.grade_id, NEW.city_id, NEW.price_per_maund, NEW.price_per_ton, NEW.source_id,
            NEW.submitted_by, NEW.reviewed_by, NEW.correcting_rate_id, now()
        ) returning id into new_fact_id;

        if NEW.correcting_rate_id is not null then
            update steel_rates set status = 'corrected' where id = NEW.correcting_rate_id;
        end if;

        perform log_submission_review('steel', to_jsonb(NEW) || jsonb_build_object('__table__','steel_rate_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('steel', to_jsonb(NEW) || jsonb_build_object('__table__','steel_rate_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_steel_submission
    after update on steel_rate_submissions
    for each row execute function promote_steel_submission();

-- 3f. Prize Bond draws
create or replace function promote_prize_bond_draw_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    new_fact_id uuid;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        if NEW.correcting_draw_id is not null then
            update prize_bond_draws
            set draw_date = NEW.draw_date, status = NEW.draw_status,
                source_id = NEW.source_id, approved_by = NEW.reviewed_by
            where id = NEW.correcting_draw_id
            returning id into new_fact_id;
        else
            insert into prize_bond_draws (
                denomination_id, draw_number, city_id, draw_date, status,
                source_id, submitted_by, approved_by
            ) values (
                NEW.denomination_id, NEW.draw_number, NEW.city_id, NEW.draw_date, NEW.draw_status,
                NEW.source_id, NEW.submitted_by, NEW.reviewed_by
            ) returning id into new_fact_id;
        end if;

        perform log_submission_review('prize_bonds', to_jsonb(NEW) || jsonb_build_object('__table__','prize_bond_draw_submissions','published_id', new_fact_id),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('prize_bonds', to_jsonb(NEW) || jsonb_build_object('__table__','prize_bond_draw_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_prize_bond_draw_submission
    after update on prize_bond_draw_submissions
    for each row execute function promote_prize_bond_draw_submission();

-- 3g. Prize Bond winners — expands the JSON batch into rows
create or replace function promote_prize_bond_winner_submission()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
declare
    winner jsonb;
begin
    if NEW.status = 'approved' and OLD.status = 'pending' then
        for winner in select * from jsonb_array_elements(NEW.winners_payload)
        loop
            insert into prize_bond_winners (draw_id, prize_tier, bond_number, prize_amount, submitted_by, approved_by)
            values (
                NEW.draw_id,
                (winner->>'prize_tier')::smallint,
                winner->>'bond_number',
                nullif(winner->>'prize_amount','')::numeric(14,2),
                NEW.submitted_by,
                NEW.reviewed_by
            );
        end loop;

        perform log_submission_review('prize_bonds', to_jsonb(NEW) || jsonb_build_object('__table__','prize_bond_winner_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    elsif NEW.status = 'rejected' and OLD.status = 'pending' then
        perform log_submission_review('prize_bonds', to_jsonb(NEW) || jsonb_build_object('__table__','prize_bond_winner_submissions'),
                                       to_jsonb(OLD), NEW.id, NEW.status, NEW.reviewed_by, NEW.reviewer_notes);
    end if;
    return NEW;
end;
$$;

create trigger trg_promote_prize_bond_winner_submission
    after update on prize_bond_winner_submissions
    for each row execute function promote_prize_bond_winner_submission();

-- ---------------------------------------------------------
-- 4. Crypto — no submission table; direct fact-table writes
-- from the ingestion agent still get an audit trail.
-- ---------------------------------------------------------
create or replace function log_crypto_insert()
returns trigger
language plpgsql
security definer
    set search_path = public
as $$
begin
    insert into audit_logs (entity_table, entity_id, domain, action, new_value, performed_by_system)
    values ('crypto_rates', NEW.id, 'crypto', 'auto_publish', to_jsonb(NEW), 'ingestion-agent:crypto-fetcher');
    return NEW;
end;
$$;

create trigger trg_log_crypto_insert
    after insert on crypto_rates
    for each row execute function log_crypto_insert();
