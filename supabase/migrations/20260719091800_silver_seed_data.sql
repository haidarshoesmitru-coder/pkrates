-- =========================================================
-- 20260719091800_silver_seed_data.sql
-- PKRates v1.7 -- Silver reference data.
--
-- SOURCE MANAGEMENT NOTE: the same city Sarafa Associations that
-- already verify Gold rates (seeded in 20260719091200_seed_data.sql)
-- also verify Silver rates in the real Pakistani market -- they are
-- literally the same institution. `sources.domains` is a text[],
-- not a one-source-per-domain relationship, precisely so a source
-- like this can cover more than one commodity (see the Data
-- Architecture, Section 10: "a single source... can legitimately
-- feed more than one domain"). This migration therefore UPDATEs
-- the 5 existing Sarafa Association source rows to add 'silver' to
-- their domains array, rather than inserting 5 new near-duplicate
-- source rows -- directly reusing source management as required.
-- =========================================================

insert into silver_purities (label, purity_fraction) values
    ('999 Fine', 0.9990),
    ('925 Sterling', 0.9250);

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
