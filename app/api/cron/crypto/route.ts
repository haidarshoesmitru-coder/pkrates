import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * History writer for crypto prices. vercel.json schedules this
 * once daily (01:00 UTC) because the Vercel Hobby plan does not
 * allow more frequent crons — displayed prices do NOT depend on
 * this cadence: getCryptoRates() in lib/data/rates.ts prefers a
 * live CoinGecko read (5-minute fetch cache) and falls back to
 * these DB rows. If the plan is upgraded, raising this schedule
 * to hourly only densifies the history/sparkline data.
 */

const COINGECKO_ID_BY_SYMBOL: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  USDC: "usd-coin",
  ADA: "cardano",
};

export async function GET(request: Request) {
  // Fail closed (audit Important #2): if CRON_SECRET is not set in
  // the environment, refuse to run instead of comparing against
  // the guessable literal "Bearer undefined".
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron crypto] CRON_SECRET is not set — refusing to run.");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: coins, error: coinsError } = await supabase
    .from("crypto_coins")
    .select("id, symbol")
    .returns<{ id: number; symbol: string }[]>();
  if (coinsError) {
    console.error("[cron crypto] coins query failed:", coinsError);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", "CoinGecko API")
    .maybeSingle()
    .returns<{ id: string }>();
  if (sourceError || !source) {
    console.error("[cron crypto] source lookup failed:", sourceError ?? "source row not found");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const ids = coins.map((c) => COINGECKO_ID_BY_SYMBOL[c.symbol]).filter(Boolean).join(",");
  const cgRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,pkr`,
    { cache: "no-store" }
  );
  if (!cgRes.ok) {
    return NextResponse.json({ error: `CoinGecko request failed: ${cgRes.status}` }, { status: 502 });
  }
  const prices: Record<string, { usd?: number; pkr?: number }> = await cgRes.json();

  const rows = coins
    .map((coin) => {
      const cgId = COINGECKO_ID_BY_SYMBOL[coin.symbol];
      const p = cgId ? prices[cgId] : undefined;
      if (!p?.usd || !p?.pkr) return null;
      return {
        coin_id: coin.id,
        price_usd: p.usd,
        price_pkr: p.pkr,
        usd_pkr_rate_used: p.pkr / p.usd,
        source_id: source.id,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid prices returned by CoinGecko" }, { status: 502 });
  }

  const { error: insertError } = await supabase.from("crypto_rates").insert(rows as unknown as never[]);
  if (insertError) {
    console.error("[cron crypto] insert failed:", insertError);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length, at: new Date().toISOString() });
}
