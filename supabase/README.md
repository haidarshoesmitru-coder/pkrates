# PKRates — Supabase Migrations

Run in order with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Or apply individually against a local dev database:

```bash
supabase start
supabase db reset   # applies every migration in this folder, in filename order
```

## File order (also enforced by the timestamp prefix)

1. `20260719090000_extensions_roles_users.sql` — extensions, roles, users, domain access grants, cities, RLS helper functions
2. `20260719090100_sources_audit_verification.sql` — sources, source health checks, audit log, rate verification log
3. `20260719090200_gold.sql` — Gold Rates
4. `20260719090300_currency.sql` — Currency Rates
5. `20260719090400_petrol.sql` — Petrol / Fuel Prices
6. `20260719090500_crypto.sql` — Crypto Prices (no staging table — see architecture doc)
7. `20260719090600_prize_bonds.sql` — Prize Bonds (draws + winners, each with staging tables)
8. `20260719090700_cement.sql` — Cement Rates
9. `20260719090800_steel.sql` — Steel / Saria Rates
10. `20260719090900_materialized_views.sql` — the `current_*` read layer + refresh functions
11. `20260719091000_functions_and_triggers.sql` — segregation-of-duty constraints, submission review audit logging, approval-promotion triggers, publish notifications
12. `20260719091100_rls_policies.sql` — Row Level Security across every table
13. `20260719091200_seed_data.sql` — reference dimensions + initial source registry

## One-time manual step after first deploy

Create the founding Super Admin: sign up a user via Supabase Auth (dashboard or your
own signup flow), then link it — this is deliberately **not** part of the automated
migrations, since seeding a privileged account via a checked-in SQL file is a security
anti-pattern:

```sql
insert into users (auth_user_id, full_name, email, role_id)
select '<auth.users.id from the Supabase dashboard>', 'Founding Admin',
       'admin@pkrates.pk', id
from roles where name = 'super_admin';
```

## What's deliberately NOT here

- No seed rows for `users` / `user_domain_access` (see above)
- No application code — this is schema, policies, and workflow logic only, per scope
- No partitioning DDL for `crypto_rates` yet — the architecture doc flags this as a
  Phase 2 action once the table passes ~10M rows, not a day-one concern

## v1.5 additions

14. `20260719091300_scheduled_view_refresh.sql` — replaces the informal
    "a listener will refresh this" comment with a real, monitored
    `pg_cron` schedule (`view_refresh_log` table + safe wrapper functions).
    Crypto refreshes every minute on its own job; Gold/Currency/Fuel/
    Cement/Steel share a 3-minute job — cadence matched to each domain's
    real update frequency, not a single blanket interval.
15. `20260719091400_anomaly_detection.sql` — the anomaly detection system.
    `BEFORE INSERT` triggers on the four domains where deviation checking
    is meaningful (Gold, Currency, Cement, Steel — matching the approved
    Data Architecture's Section 9 scope). Reuses `rate_verifications`,
    `sources.reliability_tier`, and the `flagged_anomaly` status that
    already existed in the schema — no new tables, no redesign.
16. `20260719091500_flagged_anomaly_review_patch.sql` — a necessary
    companion: the pre-v1.5 approval triggers and RLS policies only
    recognized `'pending'` as reviewable, which would have made a
    flagged submission silently stuck. Widens that condition to also
    accept `'flagged_anomaly'`. No schema change — patches existing
    function/policy logic only.

### Edge Function

`supabase/functions/refresh-rate-views/` — the event-driven complement to
the `pg_cron` schedule above. Intended to be wired to a Supabase Database
Webhook (Dashboard > Database > Webhooks, not committed here since it
requires the deployed function URL + a service-role secret) firing on
`INSERT` to any fact table, for near-instant view refresh on top of the
cron job's 1–3 minute safety-net cadence. Deploy with:

```bash
supabase functions deploy refresh-rate-views
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### New pg_notify channels

- `pkrates_rate_published` (unchanged, from v1.3) — fires on every fact-table
  insert; intended consumer is the view-refresh webhook above.
- `pkrates_anomaly_flagged` (new in v1.5) — fires only when a submission is
  auto-flagged; intended consumer is a Realtime subscription in the admin
  dashboard for live "something needs review" notifications.
