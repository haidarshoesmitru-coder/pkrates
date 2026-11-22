import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Daily-digest signup. Stores the email in newsletter_subscribers
 * (migration 20261122113000) via the service-role client — the
 * table has RLS on with no public policies, so this route is the
 * only write path. Duplicate emails are a success ("already
 * subscribed"), never an error shown to the visitor.
 */
export async function POST(request: Request) {
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
