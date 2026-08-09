import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { Sparkline } from "@/components/shared/sparkline";
import { SectionHeading } from "@/components/shared/section-heading";
import { ShareButton } from "@/components/shared/share-button";
import { WatchlistButton } from "@/components/shared/watchlist-button";
import type { TrendDirection } from "@/types";

export interface OverviewItem {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  percent: number;
  trend: TrendDirection;
  sparkline: number[];
  accent: string;
}

export function MarketOverview({ items }: { items: OverviewItem[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <SectionHeading
          eyebrow="Market Overview"
          title="The four numbers everyone checks first"
          description="A snapshot of today's headline rates before you dive into the detail."
        />
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-ink-400">Market overview is temporarily unavailable.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
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
      )}
    </section>
  );
}
