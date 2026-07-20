// supabase/functions/refresh-rate-views/index.ts
//
// PKRates v1.5 — Requirement 1 companion: the event-driven half
// of the refresh architecture. The pg_cron jobs in
// 20260719091300_scheduled_view_refresh.sql are the reliable
// baseline (worst case: 1-3 minutes stale). This function exists
// to make the common case near-instant instead: a Supabase
// Database Webhook (configured in the Dashboard, not in SQL —
// see the comment at the bottom of that migration for why) calls
// this function immediately after a row is inserted into any
// fact table, and it refreshes only the one view that changed.
//
// This function does NOT decide what counts as "published" —
// that decision already happened in Postgres (the submission
// approval triggers from migration 011). This function's only
// job is: given a table name, refresh the one read-layer view
// that corresponds to it, safely and quickly.

import { createClient } from "jsr:@supabase/supabase-js@2";

// Maps a fact table name (what the Database Webhook payload
// identifies as `table`) to its corresponding current-value
// materialized view — mirrors the same mapping already defined
// in `notify_rate_published()` (migration 011) so the two stay
// in lockstep if a domain is ever added.
const TABLE_TO_VIEW: Record<string, string> = {
  gold_rates: "current_gold_rates",
  currency_rates: "current_currency_rates",
  fuel_prices: "current_fuel_prices",
  crypto_rates: "current_crypto_rates",
  cement_rates: "current_cement_rates",
  steel_rates: "current_steel_rates",
};

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), { status: 400 });
  }

  const viewName = TABLE_TO_VIEW[payload.table];
  if (!viewName) {
    // Not an error — the webhook may be broadly subscribed; simply
    // nothing to refresh for a table this function doesn't know about.
    return new Response(JSON.stringify({ skipped: true, reason: "no matching view for table", table: payload.table }), {
      status: 200,
    });
  }

  // Service-role client: this function must bypass RLS to call the
  // refresh RPC, the same way the SECURITY DEFINER SQL functions do
  // internally. The service role key is an Edge Function secret,
  // never checked into source — set via `supabase secrets set`.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const startedAt = Date.now();

  // Calls the same `refresh_current_rate_view_safe()` the cron jobs
  // use (migration 20260719091300) — one shared, logged, exception-
  // safe implementation regardless of which trigger (schedule or
  // webhook) initiated the refresh.
  const { error } = await supabase.rpc("refresh_current_rate_view_safe", {
    view_name: viewName,
    triggered_by: "edge_function",
  });

  const durationMs = Date.now() - startedAt;

  if (error) {
    console.error(`[refresh-rate-views] failed refreshing ${viewName}:`, error.message);
    return new Response(
      JSON.stringify({ success: false, view: viewName, error: error.message, durationMs }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({ success: true, view: viewName, durationMs }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
