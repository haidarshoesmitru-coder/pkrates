import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Daily-digest signup. Stores the email in newsletter_subscribers
 * (migration 20261122113000) via the service-role client — the
 * table has RLS on with no public policies, so this route is the
 * only write path. Duplicate emails are a success ("already
 * subscribed"), never an error shown to the visitor.
 *
 * Rate limit (audit Minor #2): simple in-memory per-IP cap. This
 * resets whenever the serverless instance recycles and is not
 * shared across instances — enough to blunt casual spam floods,
 * not a hard guarantee. A durable limiter (e.g. Upstash) can
 * replace it later without changing this route's contract.
 */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const requestLog = new Map<string, number[]>();

function isRateLimited(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  // Opportunistic cleanup so the map cannot grow unbounded.
  if (requestLog.size > 1000) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(key);
    }
  }
  return false;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many requests — please try again in a few minutes." },
      { status: 429 }
    );
  }
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email, unsubscribed_at: null } as never, { onConflict: "email" });

  if (error) {
    // Most likely cause before the migration is applied: table missing.
    return NextResponse.json(
      { error: "Subscriptions are not available right now — please try again later." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
