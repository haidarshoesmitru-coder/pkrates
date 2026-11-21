import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const STALE_HOURS = 20;
const SPREAD_PCT = 0.0015;

interface CurrentRow {
  currency_id: number;
  rate_type: "interbank" | "open_market";
  effective_at: string;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: currencies, error: currenciesError } = await supabase
    .from("currencies")
    .select("id, code")
    .returns<{ id: number; code: string }[]>();
  if (currenciesError) return NextResponse.json({ error: currenciesError.message }, { status: 500 });

  const { data: currentRows, error: currentError } = await supabase
    .from("current_currency_rates")
    .select("currency_id, rate_type, effective_at")
    .returns<CurrentRow[]>();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 500 });

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", "Global Market Rate (exchangerate-api.com)")
    .maybeSingle()
    .returns<{ id: string }>();
  if (sourceError || !source) {
    return NextResponse.json(
      { error: sourceError?.message ?? "'Global Market Rate (exchangerate-api.com)' source not found — run the setup SQL first." },
      { status: 500 }
    );
  }

  const fxRes = await fetch(
    `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/USD`,
    { cache: "no-store" }
  );
  if (!fxRes.ok) return NextResponse.json({ error: `exchangerate-api request failed: ${fxRes.status}` }, { status: 502 });
  const fxJson = await fxRes.json();
  if (fxJson.result !== "success") {
    return NextResponse.json({ error: `exchangerate-api error: ${fxJson["error-type"] ?? "unknown"}` }, { status: 502 });
  }
  const rates: Record<string, number> = fxJson.conversion_rates;
  const usdToPkr = rates.PKR;
  if (!usdToPkr) return NextResponse.json({ error: "PKR rate missing from exchangerate-api response" }, { status: 502 });

  const staleCutoff = Date.now() - STALE_HOURS * 60 * 60 * 1000;
  const rateTypes: ("interbank" | "open_market")[] = ["interbank", "open_market"];
  const inserts: Record<string, unknown>[] = [];
  const skipped: string[] = [];

  for (const currency of currencies) {
    const usdToTarget = rates[currency.code];
    if (!usdToTarget) continue;
    const pkrPerUnit = usdToPkr / usdToTarget;

    for (const rateType of rateTypes) {
      const existing = currentRows.find((r) => r.currency_id === currency.id && r.rate_type === rateType);
      const isFresh = existing && new Date(existing.effective_at).getTime() > staleCutoff;
      if (isFresh) {
        skipped.push(`${currency.code}/${rateType}`);
        continue;
      }
      const buy = Math.round(pkrPerUnit * (1 - SPREAD_PCT) * 10000) / 10000;
      const sell = Math.round(pkrPerUnit * (1 + SPREAD_PCT) * 10000) / 10000;
      inserts.push({
        currency_id: currency.id,
        rate_type: rateType,
        buy_rate: buy,
        sell_rate: sell,
        source_id: source.id,
        submitted_by: null,
        approved_by: null,
        effective_at: new Date().toISOString(),
      });
    }
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("currency_rates").insert(inserts as never[]);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    await supabase.rpc("refresh_current_rate_view", { view_name: "current_currency_rates" } as never);
  }

  return NextResponse.json({
    inserted: inserts.length,
    skippedBecauseFresh: skipped,
    at: new Date().toISOString(),
  });
}
