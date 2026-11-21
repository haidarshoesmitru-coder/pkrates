import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: coins, error: coinsError } = await supabase
    .from("crypto_coins")
    .select("id, symbol")
    .returns<{ id: number; symbol: string }[]>();
  if (coinsError) {
    return NextResponse.json({ error: coinsError.message }, { status: 500 });
  }

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", "CoinGecko API")
    .maybeSingle()
    .returns<{ id: string }>();
  if (sourceError || !source) {
    return NextResponse.json(
      { error: sourceError?.message ?? "CoinGecko API source not found in `sources` table" },
      { status: 500 }
    );
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
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: rows.length, at: new Date().toISOString() });
}
