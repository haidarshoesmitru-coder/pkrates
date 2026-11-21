import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Mover } from "@/types";

const categoryTint: Record<string, string> = {
  Gold: "text-gold-600 dark:text-gold-400",
  Currency: "text-pulse-600 dark:text-pulse-400",
  Crypto: "text-amber-600 dark:text-amber-400",
  Cement: "text-ink-600 dark:text-ink-300",
  Steel: "text-ink-600 dark:text-ink-300",
};

export function MoversSection({ movers }: { movers: Mover[] }) {
  const gainers = movers.filter((m) => m.trend === "up");
  const losers = movers.filter((m) => m.trend === "down");

  return (
    <section className="border-t border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Today's Biggest Moves"
          title="What actually moved today, across every category"
          description="The largest gains and drops across gold, currency, crypto, cement and steel — ranked by percentage change."
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-rise-600 dark:text-pulse-400">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide">
                Top Gainers
              </h3>
            </div>
            <div className="mt-4 divide-y divide-ink-200 dark:divide-ink-800">
              {gainers.map((m) => (
                <div key={m.label} className="flex items-center justify-between py-3.5">
                  <div>
                    <Badge variant="outline" className={`mb-1 ${categoryTint[m.category]}`}>
                      {m.category}
                    </Badge>
                    <p className="font-medium text-sm text-ink-900 dark:text-ink-100">{m.label}</p>
                    <p className="text-xs text-ink-400">{m.sublabel}</p>
                  </div>
                  <div className="text-right">
                    <DeltaBadge percent={m.changePercent} trend={m.trend} />
                    <p className="mt-1 font-rate text-xs text-ink-400">{m.changeAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-fall-600 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wide">
                Top Losers
              </h3>
            </div>
            <div className="mt-4 divide-y divide-ink-200 dark:divide-ink-800">
              {losers.map((m) => (
                <div key={m.label} className="flex items-center justify-between py-3.5">
                  <div>
                    <Badge variant="outline" className={`mb-1 ${categoryTint[m.category]}`}>
                      {m.category}
                    </Badge>
                    <p className="font-medium text-sm text-ink-900 dark:text-ink-100">{m.label}</p>
                    <p className="text-xs text-ink-400">{m.sublabel}</p>
                  </div>
                  <div className="text-right">
                    <DeltaBadge percent={m.changePercent} trend={m.trend} />
                    <p className="mt-1 font-rate text-xs text-ink-400">{m.changeAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
