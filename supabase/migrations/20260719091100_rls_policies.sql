-- =========================================================
-- 012_rls_policies.sql
-- Row Level Security. This is the actual security boundary —
-- application/UI logic is never trusted alone. Key principle:
-- Editors/Reviewers get INSERT on *_submissions tables only.
-- NO role other than the SECURITY DEFINER trigger functions in
-- 011 can INSERT into a published fact table. There is exactly
-- one path to a fact table row: an approved submission.
-- =========================================================

-- ---------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------
alter table roles enable row level security;
alter table users enable row level security;
alter table user_domain_access enable row level security;
alter table cities enable row level security;
alter table sources enable row level security;
alter table source_health_checks enable row level security;
alter table audit_logs enable row level security;
alter table rate_verifications enable row level security;

alter table gold_karats enable row level security;
alter table gold_rates enable row level security;
alter table gold_rate_submissions enable row level security;

alter table currencies enable row level security;
alter table currency_rates enable row level security;
alter table currency_rate_submissions enable row level security;

alter table fuel_types enable row level security;
alter table fuel_prices enable row level security;
alter table fuel_price_submissions enable row level security;

alter table crypto_coins enable row level security;
alter table crypto_rates enable row level security;

alter table prize_bond_denominations enable row level security;
alter table prize_bond_draws enable row level security;
alter table prize_bond_draw_submissions enable row level security;
alter table prize_bond_winners enable row level security;
alter table prize_bond_winner_submissions enable row level security;

alter table cement_brands enable row level security;
alter table cement_rates enable row level security;
alter table cement_rate_submissions enable row level security;

alter table steel_grades enable row level security;
alter table steel_rates enable row level security;
alter table steel_rate_submissions enable row level security;

-- ---------------------------------------------------------
-- Reference / dimension tables — public read, admin-managed write
-- ---------------------------------------------------------
create policy "reference data is publicly readable" on roles for select using (true);
create policy "reference data is publicly readable" on cities for select using (true);
create policy "reference data is publicly readable" on gold_karats for select using (true);
create policy "reference data is publicly readable" on currencies for select using (true);
create policy "reference data is publicly readable" on fuel_types for select using (true);
create policy "reference data is publicly readable" on crypto_coins for select using (true);
create policy "reference data is publicly readable" on prize_bond_denominations for select using (true);
create policy "reference data is publicly readable" on cement_brands for select using (true);
create policy "reference data is publicly readable" on steel_grades for select using (true);

create policy "admins manage cities" on cities for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage gold_karats" on gold_karats for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage currencies" on currencies for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage fuel_types" on fuel_types for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage crypto_coins" on crypto_coins for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage prize_bond_denominations" on prize_bond_denominations for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage cement_brands" on cement_brands for all
    using (is_admin_or_above()) with check (is_admin_or_above());
create policy "admins manage steel_grades" on steel_grades for all
    using (is_admin_or_above()) with check (is_admin_or_above());

-- ---------------------------------------------------------
-- Users & access grants
-- ---------------------------------------------------------
create policy "users read own profile" on users for select
    using (auth_user_id = auth.uid() or is_admin_or_above());
create policy "admins manage users" on users for insert
    with check (is_admin_or_above());
create policy "admins update users" on users for update
    using (is_admin_or_above()) with check (is_admin_or_above());
-- No delete policy on users at all — deactivate via is_active, never remove
-- (preserves submitted_by/approved_by referential history on every domain table).

create policy "users read own domain access" on user_domain_access for select
    using (
        user_id = current_app_user_id() or is_admin_or_above()
    );
create policy "admins manage domain access" on user_domain_access for all
    using (is_admin_or_above()) with check (is_admin_or_above());

-- ---------------------------------------------------------
-- Sources & health checks
-- ---------------------------------------------------------
create policy "sources are publicly readable" on sources for select
    using (is_active = true or is_admin_or_above());
create policy "admins manage sources" on sources for insert
    with check (is_admin_or_above());
create policy "admins update sources" on sources for update
    using (is_admin_or_above()) with check (is_admin_or_above());
-- No delete policy on sources — deactivate only, preserving every historical citation.

create policy "admins and analysts read source health" on source_health_checks for select
    using (is_admin_or_above() or has_role('analyst') or has_role('reviewer'));
create policy "service role writes source health" on source_health_checks for insert
    with check (auth.role() = 'service_role');
-- No update/delete policy — health checks are an append-only log.

-- ---------------------------------------------------------
-- Audit log — read scoped by role/domain, no write policy at
-- all for client roles (writes happen only via SECURITY DEFINER
-- trigger functions, which bypass RLS by design).
-- ---------------------------------------------------------
create policy "audit log read access" on audit_logs for select
    using (
        is_admin_or_above()
        or has_role('analyst')
        or (has_role('reviewer') and can_review(domain))
    );
-- Deliberately no insert/update/delete policy for any client role —
-- append-only, write path is exclusively the SECURITY DEFINER functions.

create policy "verification log read access" on rate_verifications for select
    using (is_admin_or_above() or has_role('analyst') or can_review(domain));
create policy "service role writes verifications" on rate_verifications for insert
    with check (auth.role() = 'service_role' or is_admin_or_above());

-- ---------------------------------------------------------
-- Fact tables — public reads published rows; NO client-role
-- INSERT/UPDATE policy exists. Rows only ever appear via the
-- SECURITY DEFINER promotion triggers in 011.
-- ---------------------------------------------------------
create policy "published gold rates are public" on gold_rates for select
    using (status = 'published' or is_admin_or_above() or can_review('gold'));
create policy "published currency rates are public" on currency_rates for select
    using (status = 'published' or is_admin_or_above() or can_review('currency'));
create policy "published fuel prices are public" on fuel_prices for select
    using (status = 'published' or is_admin_or_above() or can_review('petrol'));
create policy "published cement rates are public" on cement_rates for select
    using (status = 'published' or is_admin_or_above() or can_review('cement'));
create policy "published steel rates are public" on steel_rates for select
    using (status = 'published' or is_admin_or_above() or can_review('steel'));
create policy "prize bond draws are public" on prize_bond_draws for select using (true);
create policy "prize bond winners are public" on prize_bond_winners for select using (true);

-- Crypto is the sole exception: the ingestion agent (service role)
-- writes directly, since api_auto means no human-review gate exists.
create policy "crypto rates are public" on crypto_rates for select using (true);
create policy "service role writes crypto rates" on crypto_rates for insert
    with check (auth.role() = 'service_role');

-- ---------------------------------------------------------
-- Submission / staging tables — the only tables Editors and
-- Reviewers can directly write to.
-- ---------------------------------------------------------

-- Gold
create policy "editors submit gold" on gold_rate_submissions for insert
    with check (can_edit('gold') and submitted_by = current_app_user_id());
create policy "domain staff read gold submissions" on gold_rate_submissions for select
    using (can_edit('gold') or is_admin_or_above());
create policy "reviewers decide gold submissions" on gold_rate_submissions for update
    using (can_review('gold') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

-- Currency
create policy "editors submit currency" on currency_rate_submissions for insert
    with check (
        (submitted_by is null and auth.role() = 'service_role')  -- api_reviewed interbank ingestion
        or (can_edit('currency') and submitted_by = current_app_user_id())
    );
create policy "domain staff read currency submissions" on currency_rate_submissions for select
    using (can_edit('currency') or is_admin_or_above());
create policy "reviewers decide currency submissions" on currency_rate_submissions for update
    using (can_review('currency') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

-- Petrol
create policy "editors submit petrol" on fuel_price_submissions for insert
    with check (can_edit('petrol') and submitted_by = current_app_user_id());
create policy "domain staff read petrol submissions" on fuel_price_submissions for select
    using (can_edit('petrol') or is_admin_or_above());
create policy "reviewers decide petrol submissions" on fuel_price_submissions for update
    using (can_review('petrol') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

-- Cement
create policy "editors submit cement" on cement_rate_submissions for insert
    with check (can_edit('cement') and submitted_by = current_app_user_id());
create policy "domain staff read cement submissions" on cement_rate_submissions for select
    using (can_edit('cement') or is_admin_or_above());
create policy "reviewers decide cement submissions" on cement_rate_submissions for update
    using (can_review('cement') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

-- Steel
create policy "editors submit steel" on steel_rate_submissions for insert
    with check (can_edit('steel') and submitted_by = current_app_user_id());
create policy "domain staff read steel submissions" on steel_rate_submissions for select
    using (can_edit('steel') or is_admin_or_above());
create policy "reviewers decide steel submissions" on steel_rate_submissions for update
    using (can_review('steel') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

-- Prize Bonds (draws + winners)
create policy "editors submit prize bond draws" on prize_bond_draw_submissions for insert
    with check (can_edit('prize_bonds') and submitted_by = current_app_user_id());
create policy "domain staff read prize bond draw submissions" on prize_bond_draw_submissions for select
    using (can_edit('prize_bonds') or is_admin_or_above());
create policy "reviewers decide prize bond draw submissions" on prize_bond_draw_submissions for update
    using (can_review('prize_bonds') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

create policy "editors submit prize bond winners" on prize_bond_winner_submissions for insert
    with check (can_edit('prize_bonds') and submitted_by = current_app_user_id());
create policy "domain staff read prize bond winner submissions" on prize_bond_winner_submissions for select
    using (can_edit('prize_bonds') or is_admin_or_above());
create policy "reviewers decide prize bond winner submissions" on prize_bond_winner_submissions for update
    using (can_review('prize_bonds') and status = 'pending')
    with check (reviewed_by = current_app_user_id());

-- No delete policy exists anywhere in this file for any submission
-- table — rejected submissions are retained permanently as the
-- record of what was proposed and why it didn't publish.
