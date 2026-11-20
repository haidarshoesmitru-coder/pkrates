"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { Sparkline } from "@/components/shared/sparkline";
import { SectionHeading } from "@/components/shared/section-heading";
import { ShareButton } from "@/components/shared/share-button";
import { WatchlistButton } from "@/components/shared/watchlist-button";
import {
  HistoricalRangeTabs,
  type HistoricalRange,
} from "@/components/shared/historical-range-tabs";
import { formatPKR } from "@/lib/utils";
import type { GoldCityRate } from "@/types";
import type { ComparisonResult } from "@/lib/data/history";

const karatTabs = [
  { key: "karat24" as const, label: "24K" },
  { key: "karat22" as const, label: "22K" },
  { key: "karat21" as const, label: "21K" },
  { key: "karat18" as const, label: "18K" },
];

function GoldCard({
  city,
  value,
  changePercent,
  trend,
  karatLabel,
  historyByRange,
}: {
  city: string;
  value: number;
  changePercent: number;
  trend: "up" | "down" | "flat";
  karatLabel: string;
  historyByRange: Record<"1D" | "7D" | "1M" | "1Y", number[]> | undefined;
}) {
  const [range, setRange] = React.useState<HistoricalRange>("7D");
  const series = historyByRange?.[range] ?? [];

  return (
    <Card className="p-5 hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">
          {city}
        </h3>
        <div className="flex items-center gap-1">
          <Badge variant="gold">Gold {karatLabel}</Badge>
          <ShareButton title={`Gold ${karatLabel} — ${city}`} text={`Gold ${karatLabel} in ${city}: Rs ${formatPKR(value)} per tola on PKRates`} />
          <WatchlistButton id={`gold-${city.toLowerCase()}-${karatLabel}`} />
        </div>
      </div>

      <p className="mt-3 font-rate text-3xl font-semibold text-ink-950 dark:text-white">
        Rs {formatPKR(value)}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xs text-ink-400">per tola</span>
        <DeltaBadge percent={changePercent} trend={trend} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] text-ink-400">Historical</span>
        <HistoricalRangeTabs value={range} onChange={setRange} />
      </div>
      <div className="mt-2">
        <Sparkline data={series} />
      </div>
    </Card>
  );
}

export function GoldSection({
  rates,
  historyByRange,
  comparison,
}: {
  rates: GoldCityRate[];
  historyByRange: Record<string, Record<"1D" | "7D" | "1M" | "1Y", number[]>>;
  comparison: ComparisonResult;
}) {
  const [activeKarat, setActiveKarat] = React.useState<typeof karatTabs[number]["key"]>("karat24");
  const karatLabel = karatTabs.find((t) => t.key === activeKarat)?.label ?? "24K";

  if (rates.length === 0) {
    return (
      <section className="border-t border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <SectionHeading eyebrow="Gold Rates" title="Gold rates are temporarily unavailable" />
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading
            eyebrow="Gold Rates"
            title="City-wise gold rates, verified against Sarafa boards"
            description="Rates per tola across major cities, cross-checked multiple times a day."
          />
          <div className="flex gap-1.5 rounded-full bg-ink-100 dark:bg-ink-900 p-1 self-start">
            {karatTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveKarat(tab.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium font-rate transition-colors ${
                  activeKarat === tab.key
                    ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-sm"
                    : "text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* vs Yesterday / vs Last Week / vs Last Month comparison strip */}
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-4 sm:p-5">
          <div className="text-center sm:text-left">
            <p className="text-[11px] text-ink-400">vs Yesterday</p>
            <p className={`mt-0.5 font-rate text-sm sm:text-base font-semibold ${comparison.vsYesterday.amount >= 0 ? "text-rise-600 dark:text-pulse-400" : "text-fall-600 dark:text-red-300"}`}>
              {comparison.vsYesterday.amount >= 0 ? "+" : ""}Rs {formatPKR(comparison.vsYesterday.amount)} ({comparison.vsYesterday.percent}%)
            </p>
          </div>
          <div className="text-center sm:text-left border-x border-ink-200 dark:border-ink-800">
            <p className="text-[11px] text-ink-400">vs Last Week</p>
            <p className={`mt-0.5 font-rate text-sm sm:text-base font-semibold ${comparison.vsLastWeek.amount >= 0 ? "text-rise-600 dark:text-pulse-400" : "text-fall-600 dark:text-red-300"}`}>
              {comparison.vsLastWeek.amount >= 0 ? "+" : ""}Rs {formatPKR(comparison.vsLastWeek.amount)} ({comparison.vsLastWeek.percent}%)
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[11px] text-ink-400">vs Last Month</p>
            <p className={`mt-0.5 font-rate text-sm sm:text-base font-semibold ${comparison.vsLastMonth.amount >= 0 ? "text-rise-600 dark:text-pulse-400" : "text-fall-600 dark:text-red-300"}`}>
              {comparison.vsLastMonth.amount >= 0 ? "+" : ""}Rs {formatPKR(comparison.vsLastMonth.amount)} ({comparison.vsLastMonth.percent}%)
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rates.map((rate) => (
            <GoldCard
              key={rate.city}
              city={rate.city}
              value={rate[activeKarat]}
              changePercent={rate.changePercent}
              trend={rate.trend}
              karatLabel={karatLabel}
              historyByRange={historyByRange[rate.city]}
            />
          ))}

          <Card className="p-5 flex flex-col justify-between bg-pulse-600 dark:bg-pulse-700 border-none text-white">
            <div>
              <h3 className="font-display text-base font-semibold">All 10+ cities</h3>
              <p className="mt-2 text-sm text-pulse-50/90 leading-relaxed">
                See the full city breakdown, per-gram pricing and 90-day historical charts.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-6 w-fit border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <Link href="/gold">
                View full gold rates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
