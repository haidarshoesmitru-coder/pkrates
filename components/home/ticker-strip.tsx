import { DeltaBadge } from "@/components/shared/delta-badge";
import { formatPKR } from "@/lib/utils";
import { goldRates, currencyRates, fuelPrices, biggestMovers } from "@/lib/mock-data";

const tickerItems = [
  { label: "Gold 24K (Karachi)", value: `Rs ${formatPKR(goldRates[0].karat24)}`, percent: goldRates[0].changePercent, trend: goldRates[0].trend },
  { label: "USD / PKR", value: formatPKR(currencyRates[0].interbankSell, { decimals: 2 }), percent: currencyRates[0].changePercent, trend: currencyRates[0].trend },
  { label: "Petrol", value: `Rs ${formatPKR(fuelPrices[0].pricePerLiter, { decimals: 2 })}`, percent: fuelPrices[0].changePercent, trend: fuelPrices[0].trend },
  { label: "Bitcoin (BTC)", value: "Rs 24.2M", percent: biggestMovers[1].changePercent, trend: biggestMovers[1].trend },
  { label: "GBP / PKR", value: formatPKR(currencyRates[2].interbankSell, { decimals: 2 }), percent: currencyRates[2].changePercent, trend: currencyRates[2].trend },
  { label: "Steel Grade 60 (Karachi)", value: "Rs 268,400 / ton", percent: -2.14, trend: "down" as const },
  { label: "Diesel", value: `Rs ${formatPKR(fuelPrices[1].pricePerLiter, { decimals: 2 })}`, percent: fuelPrices[1].changePercent, trend: fuelPrices[1].trend },
  { label: "Lucky Cement (Lahore)", value: "Rs 1,570 / bag", percent: 1.42, trend: "up" as const },
];

function TickerRow() {
  return (
    <>
      {tickerItems.map((item) => (
        <div key={item.label} className="flex items-center gap-3 px-6 py-3 whitespace-nowrap">
          <span className="text-xs font-medium text-ink-400">{item.label}</span>
          <span className="font-rate text-sm font-semibold text-ink-900 dark:text-ink-100">
            {item.value}
          </span>
          <DeltaBadge percent={item.percent} trend={item.trend} />
        </div>
      ))}
    </>
  );
}

export function TickerStrip() {
  return (
    <div className="relative border-b border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)] overflow-hidden">
      <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
        <div className="flex divide-x divide-ink-200 dark:divide-ink-800">
          <TickerRow />
        </div>
        <div className="flex divide-x divide-ink-200 dark:divide-ink-800" aria-hidden="true">
          <TickerRow />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--surface-muted)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--surface-muted)] to-transparent" />
    </div>
  );
}
