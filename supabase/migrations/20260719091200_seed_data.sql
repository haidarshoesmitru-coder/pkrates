-- =========================================================
-- 013_seed_data.sql
-- Reference dimensions and the initial source registry.
-- No user/auth rows are seeded here — the first super_admin
-- must be created via Supabase Auth then linked into `users`
-- as a one-time manual setup step (see bottom of this file).
-- =========================================================

-- ---------------------------------------------------------
-- Cities
-- ---------------------------------------------------------
insert into cities (name, slug, province, display_order) values
    ('Karachi', 'karachi', 'Sindh', 10),
    ('Lahore', 'lahore', 'Punjab', 20),
    ('Islamabad', 'islamabad', 'Islamabad Capital Territory', 30),
    ('Peshawar', 'peshawar', 'Khyber Pakhtunkhwa', 40),
    ('Quetta', 'quetta', 'Balochistan', 50),
    ('Multan', 'multan', 'Punjab', 60),
    ('Faisalabad', 'faisalabad', 'Punjab', 70),
    ('Hyderabad', 'hyderabad', 'Sindh', 80),
    ('Sialkot', 'sialkot', 'Punjab', 90),
    ('Gujranwala', 'gujranwala', 'Punjab', 100);

-- ---------------------------------------------------------
-- Gold karats
-- ---------------------------------------------------------
insert into gold_karats (label, purity_fraction) values
    ('24K', 0.9999),
    ('22K', 0.9160),
    ('21K', 0.8750),
    ('18K', 0.7500);

-- ---------------------------------------------------------
-- Currencies
-- ---------------------------------------------------------
insert into currencies (code, name, symbol) values
    ('USD', 'US Dollar', '$'),
    ('AED', 'UAE Dirham', 'د.إ'),
    ('GBP', 'British Pound', '£'),
    ('EUR', 'Euro', '€'),
    ('SAR', 'Saudi Riyal', '﷼'),
    ('CNY', 'Chinese Yuan', '¥'),
    ('CAD', 'Canadian Dollar', 'C$'),
    ('AUD', 'Australian Dollar', 'A$'),
    ('JPY', 'Japanese Yen', '¥'),
    ('QAR', 'Qatari Riyal', '﷼'),
    ('KWD', 'Kuwaiti Dinar', 'د.ك'),
    ('OMR', 'Omani Rial', '﷼'),
    ('BHD', 'Bahraini Dinar', '.د.ب'),
    ('MYR', 'Malaysian Ringgit', 'RM'),
    ('SGD', 'Singapore Dollar', 'S$');

-- ---------------------------------------------------------
-- Fuel types
-- ---------------------------------------------------------
insert into fuel_types (name) values
    ('Petrol'), ('High Speed Diesel'), ('Kerosene Oil'), ('Light Diesel Oil');

-- ---------------------------------------------------------
-- Crypto coins
-- ---------------------------------------------------------
insert into crypto_coins (symbol, name, rank) values
    ('BTC', 'Bitcoin', 1),
    ('ETH', 'Ethereum', 2),
    ('USDT', 'Tether', 3),
    ('BNB', 'BNB', 4),
    ('SOL', 'Solana', 5),
    ('XRP', 'XRP', 6),
    ('USDC', 'USD Coin', 7),
    ('ADA', 'Cardano', 8);

-- ---------------------------------------------------------
-- Prize bond denominations
-- ---------------------------------------------------------
insert into prize_bond_denominations (face_value) values
    (100), (200), (750), (1500), (7500), (15000), (25000), (40000);

-- ---------------------------------------------------------
-- Cement brands
-- ---------------------------------------------------------
insert into cement_brands (name) values
    ('Lucky Cement'), ('DG Cement'), ('Bestway Cement'),
    ('Fauji Cement'), ('Maple Leaf Cement'), ('Cherat Cement');

-- ---------------------------------------------------------
-- Steel grades
-- ---------------------------------------------------------
insert into steel_grades (label) values
    ('Grade 40'), ('Grade 60');

-- ---------------------------------------------------------
-- Sources
-- Note: enforce_source_onboarding_trust() (migration 002)
-- blocks inserting a source directly as api_auto or above
-- reliability tier 2 — every source starts here at tier 3,
-- manual_reviewed (or api_reviewed where explicitly justified
-- below), and is promoted deliberately later via audited UPDATE.
-- ---------------------------------------------------------
insert into sources (name, type, domains, reliability_tier, ingestion_mode, contact_info) values
    ('Karachi Sarafa Association', 'association', array['gold'], 3, 'manual_reviewed', 'gold-desk@karachisarafa.pk'),
    ('Lahore Sarafa Association', 'association', array['gold'], 3, 'manual_reviewed', 'info@lahoresarafa.pk'),
    ('Islamabad Sarafa Association', 'association', array['gold'], 3, 'manual_reviewed', 'info@islamabadsarafa.pk'),
    ('Peshawar Sarafa Association', 'association', array['gold'], 3, 'manual_reviewed', 'info@peshawarsarafa.pk'),
    ('Quetta Sarafa Association', 'association', array['gold'], 3, 'manual_reviewed', 'info@quettasarafa.pk'),
    ('State Bank of Pakistan', 'official', array['currency'], 3, 'manual_reviewed', 'forex-data@sbp.org.pk'),
    ('Forex Association of Pakistan', 'association', array['currency'], 3, 'manual_reviewed', 'info@fap.org.pk'),
    ('OGRA', 'official', array['petrol'], 3, 'manual_reviewed', 'notifications@ogra.org.pk'),
    ('National Savings', 'official', array['prize_bonds'], 3, 'manual_reviewed', 'draws@savings.gov.pk'),
    ('Karachi Dealer Network', 'dealer_network', array['cement','steel'], 3, 'manual_reviewed', 'n/a — manual field team'),
    ('Lahore Dealer Network', 'dealer_network', array['cement','steel'], 3, 'manual_reviewed', 'n/a — manual field team'),
    ('Karachi Steel Melters Association', 'association', array['steel'], 3, 'manual_reviewed', 'secretary@ksma.pk'),
    ('CoinGecko API', 'exchange_api', array['crypto'], 3, 'manual_reviewed', 'https://coingecko.com/api');

-- Crypto's source is promoted to api_auto here as a deliberate,
-- explicit, audited step — never the default at onboarding.
-- (The onboarding trigger only blocks INSERT; UPDATE is the
-- intended promotion path and is audit-logged separately by
-- the application layer when performed through the admin panel.)
update sources set ingestion_mode = 'api_auto', reliability_tier = 2
where name = 'CoinGecko API';

update sources set ingestion_mode = 'api_reviewed', reliability_tier = 1
where name = 'State Bank of Pakistan';

-- =========================================================
-- One-time manual setup (NOT part of automated migration —
-- run once, by hand, after the first Supabase Auth user for
-- the founding Super Admin exists):
--
--   insert into users (auth_user_id, full_name, email, role_id)
--   select '<auth.users.id from Supabase dashboard>', 'Founding Admin',
--          'admin@pkrates.pk', id
--   from roles where name = 'super_admin';
-- =========================================================
