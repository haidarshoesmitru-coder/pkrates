-- =========================================================
-- 20261122110000_extra_cities_sources.sql
-- Add the 9 extra tracked cities to the admin gold/silver
-- workflow: ensure all 14 public cities exist in `cities`,
-- and give each of the 9 newer cities its own Sarafa
-- Association source row (same naming/domains pattern as the
-- original 5 from 20260719091200_seed_data.sql, covering both
-- gold and silver per 20260719091800_silver_seed_data.sql).
--
-- Idempotent: safe to run more than once. Existing rows are
-- never modified except the guarded domains backfill at the
-- end. No rates are touched.
-- =========================================================

-- ---------------------------------------------------------
-- Cities: seed migration 20260719091200 created 10; the
-- public site tracks 14. Add the missing 4 (no-op if the
-- live database already has them).
-- ---------------------------------------------------------
insert into cities (name, slug, province, display_order) values
    ('Rawalpindi', 'rawalpindi', 'Punjab', 55),
    ('Bahawalpur', 'bahawalpur', 'Punjab', 105),
    ('Sargodha', 'sargodha', 'Punjab', 110),
    ('Sukkur', 'sukkur', 'Sindh', 120)
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- Sources: one Sarafa Association per extra city, covering
-- gold + silver. `sources` has no unique constraint on name,
-- so each insert is guarded by NOT EXISTS. Tier 3 /
-- manual_reviewed matches the onboarding rules in migration
-- 20260719090100 (sources never start above tier 2 or as
-- api_auto). contact_info left null — no invented addresses.
-- ---------------------------------------------------------
insert into sources (name, type, domains, reliability_tier, ingestion_mode, contact_info)
select v.name, 'association', array['gold', 'silver'], 3, 'manual_reviewed', null
from (values
    ('Rawalpindi Sarafa Association'),
    ('Multan Sarafa Association'),
    ('Faisalabad Sarafa Association'),
    ('Hyderabad Sarafa Association'),
    ('Sialkot Sarafa Association'),
    ('Bahawalpur Sarafa Association'),
    ('Gujranwala Sarafa Association'),
    ('Sargodha Sarafa Association'),
    ('Sukkur Sarafa Association')
) as v(name)
where not exists (select 1 from sources s where s.name = v.name);

-- ---------------------------------------------------------
-- Backfill: make sure the original 5 Sarafa sources cover
-- silver too (same guarded update as the silver seed
-- migration; no-op where already applied).
-- ---------------------------------------------------------
update sources
set domains = array_append(domains, 'silver')
where name in (
    'Karachi Sarafa Association',
    'Lahore Sarafa Association',
    'Islamabad Sarafa Association',
    'Peshawar Sarafa Association',
    'Quetta Sarafa Association'
)
and not ('silver' = any(domains));
