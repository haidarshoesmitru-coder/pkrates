import { Fuel, ShieldCheck, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatPKR } from "@/lib/utils";
import type { FuelPrice } from "@/types";

export function PetrolSection({ prices }: { prices: FuelPrice[] }) {
  return (
    <section className="border-t border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Petrol Prices"
          title="Official, government-notified fuel prices"
          description="Sourced directly from OGRA notifications — with the full change history, not just today's number."
        />

        {prices.length === 0 ? (
          <p className="mt-8 text-sm text-ink-400">Petrol prices are temporarily unavailable.</p>
        ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {prices.map((fuel) => (
            <Card key={fuel.type} className="p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-pulse-600 dark:text-pulse-400">
                  <Fuel className="h-4 w-4" />
                </span>
                <DeltaBadge percent={fuel.changePercent} trend={fuel.trend} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-ink-50">
                {fuel.type}
              </h3>
              <p className="mt-1 font-rate text-3xl font-semibold text-ink-950 dark:text-white">
                Rs {formatPKR(fuel.pricePerLiter, { decimals: 2 })}
                <span className="ml-1 text-sm font-normal text-ink-400">/ litre</span>
              </p>

              <div className="mt-5 space-y-2 border-t border-ink-200 dark:border-ink-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-pulse-500" />
                  Effective from {fuel.effectiveFrom}
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <CalendarClock className="h-3.5 w-3.5 text-ink-400" />
                  Next review expected {fuel.nextReviewEstimate}
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
