import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * IMPORTANT — read before using this client.
 *
 * Every write policy in the schema (submit/approve/reject on every
 * `*_submissions` table — see 20260719091100_rls_policies.sql and
 * 20260719091700_silver_workflow_integration.sql) is gated on
 * `auth.uid()` via `current_app_user_id()` / `can_edit()` /
 * `can_review()`. This project has no Supabase Auth wired up yet —
 * every prior production-readiness review in this repo (see
 * PKRates_Production_Readiness_Audit.md, section 7) flagged this as
 * a known, separate, larger piece of work, not something to bolt on
 * silently inside a data-layer migration task.
 *
 * Given that gap, admin WRITE actions (submit a rate, approve,
 * reject) in this release go through the service-role key, which
 * bypasses RLS entirely, server-side only, via Next.js Server
 * Actions (see lib/data/admin.ts). Every mutation still records
 * `submitted_by` / `reviewed_by` — using the seeded "system admin"
 * user's real row in the `users` table (see getSystemAdminUser() in
 * lib/data/admin.ts) rather than a fabricated id — but it cannot yet
 * attribute an action to whichever real person is sitting at the
 * keyboard, because there is no session to ask. That single
 * limitation goes away automatically the moment Supabase Auth is
 * added: swap this client for the RLS-respecting server client
 * (lib/supabase/server.ts) inside lib/data/admin.ts's mutation
 * functions, and every policy already written is ready for it.
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
