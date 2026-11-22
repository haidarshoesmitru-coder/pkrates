import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * IMPORTANT — read before using this client.
 *
 * Every write policy in the schema (submit/approve/reject on every
 * `*_submissions` table — see 20260719091100_rls_policies.sql and
 * 20260719091700_silver_workflow_integration.sql) is gated on
 * `auth.uid()` via `current_app_user_id()` / `can_edit()` /
 * `can_review()`. Supabase Auth IS wired up (middleware.ts gates
 * /admin, app/(admin)/admin/login signs in with email/password).
 *
 * Admin WRITE actions (submit a rate, approve, reject) still go
 * through the service-role key, which bypasses RLS entirely,
 * server-side only, via Next.js Server Actions (see
 * lib/data/admin.ts). Because this client bypasses RLS, the
 * authorization boundary for writes is requireAdminUser() in
 * lib/data/admin.ts: it resolves the logged-in Auth user to their
 * `users` row, checks the role server-side, and every mutation
 * records `submitted_by` / `reviewed_by` as that real user. Do not
 * add a new write path through this client without going through
 * requireAdminUser() (or, for cron routes, the CRON_SECRET check).
 *
 * This key must never reach the browser — this file is imported
 * exclusively by Server Actions / Route Handlers, never by a
 * component marked "use client".
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
