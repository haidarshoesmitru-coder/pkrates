import { Coins, Gem, Banknote, Fuel, Ticket, Package, Layers, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { domainConfigs } from "@/lib/domain-config";

const iconMap: Record<string, LucideIcon> = {
  coins: Coins, gem: Gem, banknote: Banknote, fuel: Fuel, ticket: Ticket, package: Package, layers: Layers,
};

export interface TimelineEntry {
  id: string;
  domain: string;
  summary: string;
  performedBy: string;
  performedAt: string;
  isToday: boolean;
}

export function UpdateHistoryTimeline({ entries, loadError }: { entries: TimelineEntry[]; loadError?: boolean }) {
  if (loadError) {
    return (
      <div className="p-5 sm:p-8">
        <Card className="p-10 text-center border-fall-500/40">
          <p className="text-sm text-ink-500 dark:text-ink-400">Couldn&rsquo;t load update history. Please refresh the page.</p>
        </Card>
      </div>
    );
  }

  const groupedByDay: Record<string, TimelineEntry[]> = {
    Today: entries.filter((e) => e.isToday),
    Earlier: entries.filter((e) => !e.isToday),
  };

  const hasAny = entries.length > 0;

  return (
    <div className="p-5 sm:p-8 space-y-8 max-w-3xl">
      {!hasAny && (
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-400">No published updates recorded yet.</p>
        </Card>
      )}
      {Object.entries(groupedByDay).map(([day, dayEntries]) => {
        if (dayEntries.length === 0) return null;
        return (
          <div key={day}>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-400">{day}</p>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-ink-200 dark:bg-ink-800" />
              <div className="space-y-4">
                {dayEntries.map((entry) => {
                  const config = domainConfigs[entry.domain];
                  const Icon = iconMap[config?.icon ?? "coins"] ?? Coins;
                  return (
                    <div key={entry.id} className="relative">
                      <span className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-pulse-500 ring-4 ring-[var(--surface-muted)]" />
                      <Card className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 shrink-0">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div>
                              <p className="text-xs font-medium text-ink-400">{config?.title.replace(" Management", "") ?? entry.domain}</p>
                              <p className="mt-0.5 font-rate text-sm font-semibold text-ink-900 dark:text-ink-100">
                                {entry.summary}
                              </p>
                              <p className="mt-1 text-xs text-ink-400">Approved by {entry.performedBy}</p>
                            </div>
                          </div>
                          <span className="text-xs text-ink-400 whitespace-nowrap">{entry.performedAt}</span>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
