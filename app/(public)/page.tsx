import { Coins, Banknote, Fuel, Bitcoin } from "lucide-react";
import { HeroSection } from "@/components/home/hero-section";
import { SocialProofBar } from "@/components/home/social-proof-bar";
import { TickerStrip } from "@/components/home/ticker-strip";
import { MarketOverview } from "@/components/home/market-overview";
import { MarketSentimentSection } from "@/components/home/market-sentiment-section";
import { GoldSection } from "@/components/home/gold-section";
import { CurrencySection } from "@/components/home/currency-section";
import { PetrolSection } from "@/components/home/petrol-section";
import { PrizeBondSection } from "@/components/home/prize-bond-section";
import { MoversSection } from "@/components/home/movers-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { TrustSection } from "@/components/home/trust-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getGoldRates, getSilverRates, getCurrencyRates, getFuelPrices, getCryptoRates,
  getCementRates, getSteelRates, getGoldHistoryByRange, computeLastUpdatedLabel,
} from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getPrizeBondDraws } from "@/lib/data/prize-bonds";
import { getActiveSources, getGoldKarats, getCities } from "@/lib/data/reference";
import { computeMarketSentiment } from "@/lib/data/sentiment";
import { CATEGORY_META } from "@/lib/categories-static";
import { formatPKR } from "@/lib/utils";
import type { Mover, CategoryCard, TrendDirection } from "@/types";

export default async function HomePage() {
  const [
    goldRates, silverRates, currencyRates, fuelPrices, cryptoRates,
    cementRates, steelRates, prizeBondDraws, goldHistoryByRange,
    activeSources, karats, cities,
  ] = await Promise.all([
    getGoldRates(), getSilverRates(), getCurrencyRates("open_market"), getFuelPrices(), getCryptoRates(),
    getCementRates(), getSteelRates(), getPrizeBondDraws(), getGoldHistoryByRange(),
    getActiveSources(), getGoldKarats(), getCities(),
  ]);

  const lastUpdated = computeLastUpdatedLabel([new Date().toISOString()]);

  const karat24Id = karats.find((k) => k.label === "24K")?.id;
  const karachiId = cities.find((c) => c.name === "Karachi")?.id;
  const karachiGold = goldRates.find((r) => r.city === "Karachi") ?? goldRates[0];

  const goldComparison = goldRates.length
    ? await getComparison(
        "gold_rates", "rate_per_tola",
        { karat_id: karat24Id ?? -1, city_id: karachiId ?? -1, status: "published" },
        karachiGold.karat24
      )
    : {
        vsYesterday: { amount: 0, percent: 0, trend: "flat" as TrendDirection },
        vsLastWeek: { amount: 0, percent: 0, trend: "flat" as TrendDirection },
        vsLastMonth: { amount: 0, percent: 0, trend: "flat" as TrendDirection },
      };

  const overviewItems = [
    karachiGold && {
      id: "overview-gold-24k-karachi", icon: Coins, label: "Gold · 24K Karachi",
      value: `Rs ${formatPKR(karachiGold.karat24)}`, unit: "per tola",
      percent: karachiGold.changePercent, trend: karachiGold.trend, sparkline: karachiGold.sparkline, accent: "text-gold-500",
    },
    currencyRates[0] && {
      id: "overview-usd-pkr", icon: Banknote, label: "USD / PKR · Interbank",
      value: formatPKR(currencyRates[0].interbankSell, { decimals: 2 }), unit: "sell rate",
      percent: currencyRates[0].changePercent, trend: currencyRates[0].trend, sparkline: [] as number[], accent: "text-pulse-500",
    },
    fuelPrices[0] && {
      id: "overview-petrol", icon: Fuel, label: "Petrol",
      value: `Rs ${formatPKR(fuelPrices[0].pricePerLiter, { decimals: 2 })}`, unit: "per litre",
      percent: fuelPrices[0].changePercent, trend: fuelPrices[0].trend, sparkline: [] as number[], accent: "text-fall-500",
    },
    cryptoRates[0] && {
      id: "overview-btc", icon: Bitcoin, label: "Bitcoin (BTC)",
      value: `Rs ${(cryptoRates[0].pricePkr / 1_000_000).toFixed(1)}M`, unit: "priced in PKR",
      percent: cryptoRates[0].changePercent, trend: cryptoRates[0].trend, sparkline: cryptoRates[0].sparkline, accent: "text-gold-500",
    },
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));

  const tickerItems = [
    karachiGold && { label: "Gold 24K (Karachi)", value: `Rs ${formatPKR(karachiGold.karat24)}`, percent: karachiGold.changePercent, trend: karachiGold.trend },
    currencyRates[0] && { label: "USD / PKR", value: formatPKR(currencyRates[0].interbankSell, { decimals: 2 }), percent: currencyRates[0].changePercent, trend: currencyRates[0].trend },
    fuelPrices[0] && { label: "Petrol", value: `Rs ${formatPKR(fuelPrices[0].pricePerLiter, { decimals: 2 })}`, percent: fuelPrices[0].changePercent, trend: fuelPrices[0].trend },
    cryptoRates[0] && { label: "Bitcoin (BTC)", value: `Rs ${(cryptoRates[0].pricePkr / 1_000_000).toFixed(1)}M`, percent: cryptoRates[0].changePercent, trend: cryptoRates[0].trend },
    steelRates[0] && { label: `${steelRates[0].grade} (${steelRates[0].city})`, value: `Rs ${formatPKR(steelRates[0].pricePerTon)} / ton`, percent: steelRates[0].changePercent, trend: steelRates[0].trend },
    fuelPrices[1] && { label: fuelPrices[1].type, value: `Rs ${formatPKR(fuelPrices[1].pricePerLiter, { decimals: 2 })}`, percent: fuelPrices[1].changePercent, trend: fuelPrices[1].trend },
    cementRates[0] && { label: `${cementRates[0].brand} (${cementRates[0].city})`, value: `Rs ${formatPKR(cementRates[0].pricePerBag)} / bag`, percent: cementRates[0].changePercent, trend: cementRates[0].trend },
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));

  const gbp = currencyRates.find((c) => c.code === "GBP");
  const movers: Mover[] = [
    karachiGold && { category: "Gold" as const, label: `Gold 24K — ${karachiGold.city}`, sublabel: "Per tola", changePercent: karachiGold.changePercent, changeAmount: `${karachiGold.changeAmount >= 0 ? "+" : ""}Rs ${formatPKR(karachiGold.changeAmount)}`, trend: karachiGold.trend },
    cryptoRates[0] && { category: "Crypto" as const, label: `${cryptoRates[0].name} (${cryptoRates[0].symbol})`, sublabel: "Priced in PKR", changePercent: cryptoRates[0].changePercent, changeAmount: `${cryptoRates[0].changePercent >= 0 ? "+" : ""}${cryptoRates[0].changePercent.toFixed(2)}%`, trend: cryptoRates[0].trend },
    steelRates[0] && { category: "Steel" as const, label: `${steelRates[0].grade} Saria — ${steelRates[0].city}`, sublabel: "Per ton", changePercent: steelRates[0].changePercent, changeAmount: `${steelRates[0].changePercent >= 0 ? "+" : ""}${steelRates[0].changePercent.toFixed(2)}%`, trend: steelRates[0].trend },
    gbp && { category: "Currency" as const, label: "GBP / PKR", sublabel: "Interbank sell", changePercent: gbp.changePercent, changeAmount: `${gbp.changePercent.toFixed(2)}%`, trend: gbp.trend },
    cementRates[0] && { category: "Cement" as const, label: `${cementRates[0].brand} — ${cementRates[0].city}`, sublabel: "Per 50kg bag", changePercent: cementRates[0].changePercent, changeAmount: `${cementRates[0].changePercent >= 0 ? "+" : ""}${cementRates[0].changePercent.toFixed(2)}%`, trend: cementRates[0].trend },
    cryptoRates[1] && { category: "Crypto" as const, label: `${cryptoRates[1].name} (${cryptoRates[1].symbol})`, sublabel: "Priced in PKR", changePercent: cryptoRates[1].changePercent, changeAmount: `${cryptoRates[1].changePercent.toFixed(2)}%`, trend: cryptoRates[1].trend },
  ].filter((x): x is Mover => Boolean(x));

  const { signals, overallScore } = computeMarketSentiment([
    { category: "Gold", changePercent: karachiGold?.changePercent ?? 0 },
    { category: "Currency", changePercent: currencyRates[0]?.changePercent ?? 0 },
    { category: "Petrol", changePercent: fuelPrices[0]?.changePercent ?? 0 },
    { category: "Crypto", changePercent: cryptoRates[0]?.changePercent ?? 0, volatilityHint: true },
    { category: "Steel", changePercent: steelRates[0]?.changePercent ?? 0 },
  ]);

  const karachiSilver = silverRates.find((r) => r.city === "Karachi") ?? silverRates[0];
  const liveHeadline: Record<string, { value: string; trend: TrendDirection; percent: number }> = {
    gold: karachiGold ? { value: formatPKR(karachiGold.karat24), trend: karachiGold.trend, percent: karachiGold.changePercent } : { value: "—", trend: "flat", percent: 0 },
    silver: karachiSilver ? { value: formatPKR(karachiSilver.fine999), trend: karachiSilver.trend, percent: karachiSilver.changePercent } : { value: "—", trend: "flat", percent: 0 },
    currency: currencyRates[0] ? { value: formatPKR(currencyRates[0].interbankSell, { decimals: 2 }), trend: currencyRates[0].trend, percent: currencyRates[0].changePercent } : { value: "—", trend: "flat", percent: 0 },
    petrol: fuelPrices[0] ? { value: formatPKR(fuelPrices[0].pricePerLiter, { decimals: 2 }), trend: fuelPrices[0].trend, percent: fuelPrices[0].changePercent } : { value: "—", trend: "flat", percent: 0 },
    crypto: cryptoRates[0] ? { value: `${(cryptoRates[0].pricePkr / 1_000_000).toFixed(1)}M`, trend: cryptoRates[0].trend, percent: cryptoRates[0].changePercent } : { value: "—", trend: "flat", percent: 0 },
    "prize-bonds": { value: prizeBondDraws[0]?.date ?? "—", trend: "flat", percent: 0 },
    cement: cementRates[0] ? { value: formatPKR(cementRates[0].pricePerBag), trend: cementRates[0].trend, percent: cementRates[0].changePercent } : { value: "—", trend: "flat", percent: 0 },
    steel: steelRates[0] ? { value: formatPKR(steelRates[0].pricePerTon), trend: steelRates[0].trend, percent: steelRates[0].changePercent } : { value: "—", trend: "flat", percent: 0 },
  };
  const categories: CategoryCard[] = CATEGORY_META.map((meta) => ({
    ...meta,
    headlineValue: liveHeadline[meta.slug]?.value ?? "—",
    trend: liveHeadline[meta.slug]?.trend ?? "flat",
    changePercent: liveHeadline[meta.slug]?.percent ?? 0,
  }));

  const trustSources = activeSources.slice(0, 5).map((s) => ({
    name: s.name,
    role: `${s.domains.map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)).join(" & ")} rate verification`,
  }));

  const socialProofStats = [
    { value: "50,000+", label: "Daily active users" },
    { value: "500K+", label: "Rate checks this month" },
    { value: String(activeSources.length), label: "Verified institutional sources" },
    { value: "< 5 min", label: "Average data freshness" },
  ];

  return (
    <>
      <HeroSection
        lastUpdated={lastUpdated}
        goldKarachi24k={{ ratePerTola: karachiGold?.karat24 ?? 0, weeklyChangePercent: goldComparison.vsLastWeek.percent }}
      />
      <SocialProofBar stats={socialProofStats} />
      <TickerStrip items={tickerItems} />
      <MarketOverview items={overviewItems} />
      <MarketSentimentSection signals={signals} overallScore={overallScore} />
      <GoldSection rates={goldRates} historyByRange={goldHistoryByRange} comparison={goldComparison} />
      <CurrencySection rates={currencyRates} />
      <PetrolSection prices={fuelPrices} />
      <PrizeBondSection draws={prizeBondDraws} />
      <MoversSection movers={movers} />
      <CategoryGrid categories={categories} />
      <TrustSection sources={trustSources} />
      <NewsletterSection />
    </>
  );
}
