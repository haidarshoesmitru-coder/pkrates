import { Coins, Banknote, Fuel, Bitcoin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { Sparkline } from "@/components/shared/sparkline";
import { SectionHeading } from "@/components/shared/section-heading";
import { ShareButton } from "@/components/shared/share-button";
import { WatchlistButton } from "@/components/shared/watchlist-button";
import { formatPKR } from "@/lib/utils";
import { goldRates, currencyRates, fuelPrices } from "@/lib/mock-data";

const overview = [
  {
    id: "overview-gold-24k-karachi",
    icon: Coins,
    label: "Gold · 24K Karachi",
    value: `Rs ${formatPKR(goldRates[0].karat24)}`,
    unit: "per tola",
    percent: goldRates[0].changePercent,
    trend: goldRates[0].trend,
    sparkline: goldRates[0].sparkline,
    accent: "text-gold-500",
  },
  {
    id: "overview-usd-pkr",
    icon: Banknote,
    label: "USD / PKR · Interbank",
    value: formatPKR(currencyRates[0].interbankSell, { decimals: 2 }),
    unit: "sell rate",
    percent: currencyRates[0].changePercent,
    trend: currencyRates[0].trend,
    sparkline: [276.1, 276.6, 277.2, 277.0, 277.9, 278.4, 278.8],
    accent: "text-pulse-500",
  },
  {
    id: "overview-petrol",
    icon: Fuel,
    label: "Petrol",
    value: `Rs ${formatPKR(fuelPrices[0].pricePerLiter, { decimals: 2 })}`,
    unit: "per litre",
    percent: fuelPrices[0].changePercent,
    trend: fuelPrices[0].trend,
    sparkline: [265.4, 265.4, 265.4, 268.4, 268.4, 268.4, 272.5],
    accent: "text-fall-500",
  },
  {
    id: "overview-btc",
    icon: Bitcoin,
    label: "Bitcoin (BTC)",
    value: "Rs 24.2M",
    unit: "priced in PKR",
    percent: 3.82,
    trend: "up" as const,
    sparkline: [22.1, 22.4, 22.9, 22.7, 23.3, 23.9, 24.2],
    accent: "text-gold-500",
  },
];

export function MarketOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <SectionHeading
          eyebrow="Market Overview"
          title="The four numbers everyone checks first"
          description="A snapshot of today's headline rates before you dive into the detail."
        />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overview.map((item) => (
          <Card key={item.id} className="p-5 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 ${item.accent}`}>
                <item.icon className="h-4 w-4" />
              </span>
              <DeltaBadge percent={item.percent} trend={item.trend} />
            </div>
            <p className="mt-4 text-xs font-medium text-ink-500 dark:text-ink-400">{item.label}</p>
            <p className="mt-1 font-rate text-2xl font-semibold text-ink-950 dark:text-white">
              {item.value}
            </p>
            <p className="text-xs text-ink-400">{item.unit}</p>
            <div className="mt-3">
              <Sparkline data={item.sparkline} positive={item.trend !== "down"} />
            </div>
            <div className="mt-2 flex items-center justify-end gap-0.5 border-t border-ink-100 dark:border-ink-800 pt-2 -mb-1">
              <ShareButton title={item.label} text={`${item.label}: ${item.value} ${item.unit} — via PKRates`} />
              <WatchlistButton id={item.id} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
