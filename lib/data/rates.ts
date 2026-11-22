import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCities, getGoldKarats, getSilverPurities, getCurrencies,
  getFuelTypes, getCryptoCoins, getCementBrands, getSteelGrades,
} from "@/lib/data/reference";
import type {
  GoldCityRate, SilverCityRate, CurrencyRate, FuelPrice, TrendDirection,
  CementCityRate, SteelCityRate, CryptoRate,
} from "@/types";

/**
 * Shared change/trend/sparkline math, used by every domain fetcher
 * below rather than reimplemented per domain. `history` must be
 * ordered NEWEST first (the same order every query in this file
 * requests via `.order("effective_at", { ascending: false })`).
 */
function computeTrendFromHistory(history: number[]): {
  changeAmount: number; changePercent: number; trend: TrendDirection; sparkline: number[];
} {
  if (history.length === 0) {
    return { changeAmount: 0, changePercent: 0, trend: "flat", sparkline: [] };
  }
  const latest = history[0];
  // Compare against the last DIFFERENT value: duplicate same-value rows
  // (re-published unchanged rates) must not read as 0% change.
  const previous = history.find((v, i) => i > 0 && v !== latest);
  const changeAmount = previous !== undefined ? Math.round((latest - previous) * 100) / 100 : 0;
  const changePercent =
    previous ? Math.round(((latest - previous) / previous) * 10000) / 100 : 0;
  const trend: TrendDirection = changeAmount > 0 ? "up" : changeAmount < 0 ? "down" : "flat";
  // history is newest-first; sparkline reads oldest-first, last 7 points
  const sparkline = [...history].reverse().slice(-7);
  return { changeAmount, changePercent, trend, sparkline };
}

/**
 * Every Supabase query result below is explicitly cast to a local,
 * minimal interface matching exactly the columns selected — not left
 * to infer from the client call chain. An outer `Promise<T>` on the
 * exported function alone isn't enough: an untyped intermediate
 * variable inside the function body can independently collapse to
 * `never` and break every `.filter()`/`.map()`/`.find()` access on
 * it, which is what was happening here before this fix.
 */
interface CurrentGoldRateRow { city_id: number; karat_id: number; rate_per_tola: number; effective_at: string }
interface GoldHistoryRow { city_id: number; karat_id: number; rate_per_tola: number }
interface CurrentSilverRateRow { city_id: number; purity_id: number; rate_per_tola: number; effective_at: string }
interface SilverHistoryRow { city_id: number; purity_id: number; rate_per_tola: number }
interface CurrentCurrencyRateRow { currency_id: number; rate_type: "interbank" | "open_market"; buy_rate: number; sell_rate: number; effective_at: string; source_id: string }
interface CurrencyHistoryRow { currency_id: number; rate_type: "interbank" | "open_market"; sell_rate: number }
interface CurrentFuelPriceRow { fuel_type_id: number; price_per_liter: number; change_amount: number | null; effective_from: string }
interface CurrentCryptoRateRow { coin_id: number; price_usd: number; price_pkr: number; effective_at: string }
interface CryptoHistoryRow { coin_id: number; price_pkr: number }
interface CurrentCementRateRow { brand_id: number; city_id: number; price_per_bag: number; effective_at: string }
interface CementHistoryRow { brand_id: number; city_id: number; price_per_bag: number }
interface CurrentSteelRateRow { grade_id: number; city_id: number; price_per_maund: number; price_per_ton: number; effective_at: string }
interface SteelHistoryRow { grade_id: number; city_id: number; price_per_ton: number }

// ---------------------------------------------------------------
// Gold
// ---------------------------------------------------------------
export async function getGoldRates(): Promise<GoldCityRate[]> {
  const supabase = await createSupabaseServerClient();
  const [cities, karats, { data: currentData, error: currentErr }, { data: historyData, error: historyErr }] =
    await Promise.all([
      getCities(),
      getGoldKarats(),
      supabase.from("current_gold_rates").select("*"),
      supabase
        .from("gold_rates")
        .select("city_id, rate_per_tola, effective_at, karat_id")
        .eq("status", "published")
        .order("effective_at", { ascending: false })
        .limit(500),
    ]);
  if (currentErr) throw currentErr;
  if (historyErr) throw historyErr;
  const current = (currentData ?? []) as CurrentGoldRateRow[];
  const history = (historyData ?? []) as GoldHistoryRow[];

  const karat24 = karats.find((k) => k.label === "24K");
  const karatByLabel = (cityId: number, label: string) => {
    const karat = karats.find((k) => k.label === label);
    return current.find((r) => r.city_id === cityId && r.karat_id === karat?.id)?.rate_per_tola ?? 0;
  };

  return cities
    .filter((city) => current.some((r) => r.city_id === city.id))
    .map((city) => {
      const cityHistory = history
        .filter((h) => h.city_id === city.id && h.karat_id === karat24?.id)
        .map((h) => h.rate_per_tola);
      const { changeAmount, changePercent, trend, sparkline } = computeTrendFromHistory(cityHistory);
      const cityRows = current.filter((r) => r.city_id === city.id);
      const effectiveAt = cityRows.reduce(
        (latest, r) => (r.effective_at > latest ? r.effective_at : latest),
        cityRows[0]?.effective_at ?? ""
      );
      return {
        city: city.name,
        karat24: karatByLabel(city.id, "24K"),
        karat22: karatByLabel(city.id, "22K"),
        karat21: karatByLabel(city.id, "21K"),
        karat18: karatByLabel(city.id, "18K"),
        changeAmount, changePercent, trend, sparkline,
        effectiveAt,
      };
    });
}

// ---------------------------------------------------------------
// Silver
// ---------------------------------------------------------------
export async function getSilverRates(): Promise<SilverCityRate[]> {
  const supabase = await createSupabaseServerClient();
  const [cities, purities, { data: currentData, error: currentErr }, { data: historyData, error: historyErr }] =
    await Promise.all([
      getCities(),
      getSilverPurities(),
      supabase.from("current_silver_rates").select("*"),
      supabase
        .from("silver_rates")
        .select("city_id, rate_per_tola, effective_at, purity_id")
        .eq("status", "published")
        .order("effective_at", { ascending: false })
        .limit(500),
    ]);
  if (currentErr) throw currentErr;
  if (historyErr) throw historyErr;
  const current = (currentData ?? []) as CurrentSilverRateRow[];
  const history = (historyData ?? []) as SilverHistoryRow[];

  const fine999 = purities.find((p) => p.label === "999 Fine");
  const sterling925 = purities.find((p) => p.label === "925 Sterling");
  const valueFor = (cityId: number, purityId?: number) =>
    current.find((r) => r.city_id === cityId && r.purity_id === purityId)?.rate_per_tola ?? 0;

  return cities
    .filter((city) => current.some((r) => r.city_id === city.id))
    .map((city) => {
      const cityHistory = history
        .filter((h) => h.city_id === city.id && h.purity_id === fine999?.id)
        .map((h) => h.rate_per_tola);
      const { changeAmount, changePercent, trend, sparkline } = computeTrendFromHistory(cityHistory);
      const cityRows = current.filter((r) => r.city_id === city.id);
      const effectiveAt = cityRows.reduce(
        (latest, r) => (r.effective_at > latest ? r.effective_at : latest),
        cityRows[0]?.effective_at ?? ""
      );
      return {
        city: city.name,
        fine999: valueFor(city.id, fine999?.id),
        sterling925: valueFor(city.id, sterling925?.id),
        changeAmount, changePercent, trend, sparkline,
        effectiveAt,
      };
    });
}

// ---------------------------------------------------------------
// Currency
// ---------------------------------------------------------------
const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", AED: "🇦🇪", GBP: "🇬🇧", EUR: "🇪🇺", SAR: "🇸🇦", CNY: "🇨🇳",
  CAD: "🇨🇦", AUD: "🇦🇺", JPY: "🇯🇵", QAR: "🇶🇦", KWD: "🇰🇼", OMR: "🇴🇲",
  BHD: "🇧🇭", MYR: "🇲🇾", SGD: "🇸🇬",
};

export async function getCurrencyRates(rateType: "interbank" | "open_market" = "open_market"): Promise<CurrencyRate[]> {
  const supabase = await createSupabaseServerClient();
  const [currencies, { data: currentData, error: currentErr }, { data: historyData, error: historyErr }, { data: sourcesData, error: sourcesErr }] =
    await Promise.all([
      getCurrencies(),
      supabase.from("current_currency_rates").select("*"),
      supabase
        .from("currency_rates")
        .select("currency_id, rate_type, sell_rate, effective_at")
        .eq("status", "published")
        .order("effective_at", { ascending: false })
        .limit(500),
      supabase.from("sources").select("id, name"),
    ]);
  if (currentErr) throw currentErr;
  if (historyErr) throw historyErr;
  if (sourcesErr) throw sourcesErr;
  const current = (currentData ?? []) as CurrentCurrencyRateRow[];
  const history = (historyData ?? []) as CurrencyHistoryRow[];
  const sourceNameById = new Map(((sourcesData ?? []) as { id: string; name: string }[]).map((s) => [s.id, s.name]));

  return currencies
    .filter((c) => current.some((r) => r.currency_id === c.id && r.rate_type === rateType))
    .map((currency) => {
      const openRow = current.find((r) => r.currency_id === currency.id && r.rate_type === "open_market");
      const interbankRow = current.find((r) => r.currency_id === currency.id && r.rate_type === "interbank");
      const currencyHistory = history
        .filter((h) => h.currency_id === currency.id && h.rate_type === rateType)
        .map((h) => h.sell_rate);
      const { changePercent, trend } = computeTrendFromHistory(currencyHistory);
      const activeRow = rateType === "interbank" ? interbankRow : openRow;
      return {
        code: currency.code,
        name: currency.name,
        flag: CURRENCY_FLAGS[currency.code] ?? "🏳️",
        interbankBuy: interbankRow?.buy_rate ?? 0,
        interbankSell: interbankRow?.sell_rate ?? 0,
        openBuy: openRow?.buy_rate ?? 0,
        openSell: openRow?.sell_rate ?? 0,
        changePercent, trend,
        effectiveAt: activeRow?.effective_at ?? "",
        sourceName: (activeRow ? sourceNameById.get(activeRow.source_id) : undefined) ?? "Unknown",
      };
    });
}

// ---------------------------------------------------------------
// Petrol / Fuel
// ---------------------------------------------------------------
export async function getFuelPrices(): Promise<FuelPrice[]> {
  const supabase = await createSupabaseServerClient();
  const [fuelTypes, { data: currentData, error: currentErr }] = await Promise.all([
    getFuelTypes(),
    supabase.from("current_fuel_prices").select("*"),
  ]);
  if (currentErr) throw currentErr;
  const current = (currentData ?? []) as CurrentFuelPriceRow[];

  return fuelTypes
    .filter((ft) => current.some((r) => r.fuel_type_id === ft.id))
    .map((fuelType) => {
      const row = current.find((r) => r.fuel_type_id === fuelType.id)!;
      const changeAmount = row.change_amount ?? 0;
      const changePercent = changeAmount && row.price_per_liter
        ? Math.round((changeAmount / (row.price_per_liter - changeAmount)) * 10000) / 100
        : 0;
      const effectiveDate = new Date(row.effective_from);
      return {
        type: fuelType.name,
        pricePerLiter: row.price_per_liter,
        changeAmount,
        changePercent,
        trend: (changeAmount > 0 ? "up" : changeAmount < 0 ? "down" : "flat") as TrendDirection,
        effectiveFrom: effectiveDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        effectiveAt: row.effective_from,
        nextReviewEstimate: "Per next OGRA notification",
      };
    });
}

// ---------------------------------------------------------------
// Crypto
// ---------------------------------------------------------------
/**
 * Why a live read: the CoinGecko cron (app/api/cron/crypto) writes
 * history rows, but Vercel's Hobby plan only allows ONE cron run
 * per day, so DB-only prices sat up to ~24h stale. Displayed prices
 * therefore prefer a live CoinGecko read cached for 5 minutes via
 * Next's fetch cache; the DB rows remain the fallback (and the
 * source of history/sparkline) whenever the live read fails. Same
 * CoinGecko ids as the cron route — keep the two maps in sync.
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

async function fetchLiveCryptoPrices(symbols: string[]): Promise<Record<string, { usd: number; pkr: number }>> {
  const ids = symbols.map((s) => COINGECKO_ID_BY_SYMBOL[s]).filter(Boolean).join(",");
  if (!ids) return {};
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd,pkr`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return {};
    const json = (await res.json()) as Record<string, { usd?: number; pkr?: number }>;
    const bySymbol: Record<string, { usd: number; pkr: number }> = {};
    for (const symbol of symbols) {
      const p = json[COINGECKO_ID_BY_SYMBOL[symbol]];
      if (p?.usd && p?.pkr) bySymbol[symbol] = { usd: p.usd, pkr: p.pkr };
    }
    return bySymbol;
  } catch {
    return {};
  }
}

export async function getCryptoRates(): Promise<CryptoRate[]> {
  const supabase = await createSupabaseServerClient();
  const [coins, { data: currentData, error: currentErr }, { data: historyData, error: historyErr }] = await Promise.all([
    getCryptoCoins(),
    supabase.from("current_crypto_rates").select("*"),
    supabase
      .from("crypto_rates")
      .select("coin_id, price_pkr, effective_at")
      .order("effective_at", { ascending: false })
      .limit(700),
  ]);
  if (currentErr) throw currentErr;
  if (historyErr) throw historyErr;
  const current = (currentData ?? []) as CurrentCryptoRateRow[];
  const history = (historyData ?? []) as CryptoHistoryRow[];

  const livePrices = await fetchLiveCryptoPrices(coins.map((c) => c.symbol));
  const fetchedAt = new Date().toISOString();

  return coins
    .filter((coin) => current.some((r) => r.coin_id === coin.id) || livePrices[coin.symbol])
    .map((coin) => {
      const row = current.find((r) => r.coin_id === coin.id);
      const live = livePrices[coin.symbol];
      const coinHistory = history.filter((h) => h.coin_id === coin.id).map((h) => h.price_pkr);
      const { changePercent, trend, sparkline } = computeTrendFromHistory(coinHistory);
      return {
        symbol: coin.symbol,
        name: coin.name,
        priceUsd: live?.usd ?? row?.price_usd ?? 0,
        pricePkr: live?.pkr ?? row?.price_pkr ?? 0,
        changePercent, trend, sparkline,
        effectiveAt: live ? fetchedAt : row?.effective_at ?? "",
      };
    });
}

// ---------------------------------------------------------------
// Cement
// ---------------------------------------------------------------
export async function getCementRates(): Promise<CementCityRate[]> {
  const supabase = await createSupabaseServerClient();
  const [brands, cities, { data: currentData, error: currentErr }, { data: historyData, error: historyErr }] =
    await Promise.all([
      getCementBrands(),
      getCities(),
      supabase.from("current_cement_rates").select("*"),
      supabase
        .from("cement_rates")
        .select("brand_id, city_id, price_per_bag, effective_at")
        .eq("status", "published")
        .order("effective_at", { ascending: false })
        .limit(500),
    ]);
  if (currentErr) throw currentErr;
  if (historyErr) throw historyErr;
  const current = (currentData ?? []) as CurrentCementRateRow[];
  const history = (historyData ?? []) as CementHistoryRow[];

  return current.map((row) => {
    const brand = brands.find((b) => b.id === row.brand_id);
    const city = cities.find((c) => c.id === row.city_id);
    const pairHistory = history
      .filter((h) => h.brand_id === row.brand_id && h.city_id === row.city_id)
      .map((h) => h.price_per_bag);
    const { changePercent, trend, sparkline } = computeTrendFromHistory(pairHistory);
    return {
      brand: brand?.name ?? "Unknown brand",
      city: city?.name ?? "Unknown city",
      pricePerBag: row.price_per_bag,
      changePercent, trend, sparkline,
      effectiveAt: row.effective_at,
    };
  });
}

// ---------------------------------------------------------------
// Steel
// ---------------------------------------------------------------
export async function getSteelRates(): Promise<SteelCityRate[]> {
  const supabase = await createSupabaseServerClient();
  const [grades, cities, { data: currentData, error: currentErr }, { data: historyData, error: historyErr }] =
    await Promise.all([
      getSteelGrades(),
      getCities(),
      supabase.from("current_steel_rates").select("*"),
      supabase
        .from("steel_rates")
        .select("grade_id, city_id, price_per_ton, effective_at")
        .eq("status", "published")
        .order("effective_at", { ascending: false })
        .limit(500),
    ]);
  if (currentErr) throw currentErr;
  if (historyErr) throw historyErr;
  const current = (currentData ?? []) as CurrentSteelRateRow[];
  const history = (historyData ?? []) as SteelHistoryRow[];

  return current.map((row) => {
    const grade = grades.find((g) => g.id === row.grade_id);
    const city = cities.find((c) => c.id === row.city_id);
    const pairHistory = history
      .filter((h) => h.grade_id === row.grade_id && h.city_id === row.city_id)
      .map((h) => h.price_per_ton);
    const { changePercent, trend, sparkline } = computeTrendFromHistory(pairHistory);
    return {
      grade: grade?.label ?? "Unknown grade",
      city: city?.name ?? "Unknown city",
      pricePerMaund: row.price_per_maund,
      pricePerTon: row.price_per_ton,
      changePercent, trend, sparkline,
      effectiveAt: row.effective_at,
    };
  });
}

/**
 * Buckets one fetched history window into the 1D/7D/1M/1Y ranges
 * the homepage's interactive gold cards use. A single query (up to
 * ~120 days of published rows) is sliced rather than firing 4
 * separate range-specific queries — cheaper, and the sparkline only
 * ever renders ~7 points regardless of range, so evenly-sampled
 * points from one window is honest, real data at the resolution the
 * UI actually displays.
 */
interface GoldHistoryByRangeRow { city_id: number; rate_per_tola: number }

export async function getGoldHistoryByRange(): Promise<Record<string, Record<"1D" | "7D" | "1M" | "1Y", number[]>>> {
  const supabase = await createSupabaseServerClient();
  const [cities, karats] = await Promise.all([getCities(), getGoldKarats()]);
  const karat24Id = karats.find((k) => k.label === "24K")?.id;

  const { data: historyData, error } = await supabase
    .from("gold_rates")
    .select("city_id, rate_per_tola, effective_at")
    .eq("status", "published")
    .eq("karat_id", karat24Id ?? -1)
    .order("effective_at", { ascending: true })
    .limit(3000);
  if (error) throw error;
  const history = (historyData ?? []) as GoldHistoryByRangeRow[];

  const result: Record<string, Record<"1D" | "7D" | "1M" | "1Y", number[]>> = {};

  function sample(values: number[], points = 7): number[] {
    if (values.length <= points) return values;
    const step = (values.length - 1) / (points - 1);
    return Array.from({ length: points }, (_, i) => values[Math.round(i * step)]);
  }

  for (const city of cities) {
    const cityValues = history
      .filter((h) => h.city_id === city.id)
      .map((h) => h.rate_per_tola);
    if (cityValues.length === 0) continue;

    result[city.name] = {
      "1D": sample(cityValues.slice(-14)),
      "7D": sample(cityValues.slice(-30)),
      "1M": sample(cityValues.slice(-90)),
      "1Y": sample(cityValues),
    };
  }
  return result;
}

/** Most recent `effective_at`/`effective_from` across every domain
 * that was actually queried — replaces the hardcoded `lastUpdated`
 * string. Callers pass whichever timestamps they already fetched
 * so this never issues its own extra query. */
export function computeLastUpdatedLabel(timestamps: string[]): string {
  const valid = timestamps.filter(Boolean).map((t) => new Date(t).getTime());
  if (valid.length === 0) return "Not yet available";
  const latest = new Date(Math.max(...valid));
  return latest.toLocaleString("en-GB", {
    hour: "numeric", minute: "2-digit", hour12: true,
    day: "numeric", month: "short",
    timeZone: "Asia/Karachi",
  });
}
