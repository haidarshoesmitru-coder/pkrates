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
import { goldRates, goldHistoryByRange, goldComparison } from "@/lib/mock-data";

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
}: {
  city: string;
  value: number;
  changePercent: number;
  trend: "up" | "down" | "flat";
  karatLabel: string;
}) {
  const [range, setRange] = React.useState<HistoricalRange>("7D");
  const series = goldHistoryByRange[city]?.[range] ?? [];

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

export function GoldSection() {
  const [activeKarat, setActiveKarat] = React.useState<typeof karatTabs[number]["key"]>("karat24");
  const karatLabel = karatTabs.find((t) => t.key === activeKarat)?.label ?? "24K";

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
            <p className="mt-0.5 font-rate text-sm sm:text-base font-semibold text-rise-600 dark:text-pulse-400">
              +Rs {formatPKR(goldComparison.vsYesterday.amount)} ({goldComparison.vsYesterday.percent}%)
            </p>
          </div>
          <div className="text-center sm:text-left border-x border-ink-200 dark:border-ink-800">
            <p className="text-[11px] text-ink-400">vs Last Week</p>
            <p className="mt-0.5 font-rate text-sm sm:text-base font-semibold text-rise-600 dark:text-pulse-400">
              +Rs {formatPKR(goldComparison.vsLastWeek.amount)} ({goldComparison.vsLastWeek.percent}%)
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[11px] text-ink-400">vs Last Month</p>
            <p className="mt-0.5 font-rate text-sm sm:text-base font-semibold text-rise-600 dark:text-pulse-400">
              +Rs {formatPKR(goldComparison.vsLastMonth.amount)} ({goldComparison.vsLastMonth.percent}%)
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goldRates.map((rate) => (
            <GoldCard
              key={rate.city}
              city={rate.city}
              value={rate[activeKarat]}
              changePercent={rate.changePercent}
              trend={rate.trend}
              karatLabel={karatLabel}
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
