import { Coins, Banknote, Fuel, Ticket, Package, Layers, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { publishedRecords, domainConfigs } from "@/lib/admin-mock-data";

const iconMap: Record<string, LucideIcon> = {
  coins: Coins,
  banknote: Banknote,
  fuel: Fuel,
  ticket: Ticket,
  package: Package,
  layers: Layers,
};

// Flatten all published records into one feed, newest-looking first (mock order).
const timelineEntries = Object.entries(publishedRecords).flatMap(([domain, records]) =>
  records.map((rec) => ({ domain, ...rec }))
);

const groupedByDay: Record<string, typeof timelineEntries> = {
  Today: timelineEntries.filter((e) => e.effectiveAt.startsWith("Today")),
  Earlier: timelineEntries.filter((e) => !e.effectiveAt.startsWith("Today")),
};

export function UpdateHistoryTimeline() {
  return (
    <div className="p-5 sm:p-8 space-y-8 max-w-3xl">
      {Object.entries(groupedByDay).map(([day, entries]) => {
        if (entries.length === 0) return null;
        return (
          <div key={day}>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-400">{day}</p>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-ink-200 dark:bg-ink-800" />
              <div className="space-y-4">
                {entries.map((entry) => {
                  const config = domainConfigs[entry.domain];
                  const Icon = iconMap[config.icon] ?? Coins;
                  const summary = entry.fields.map((f) => f.value).join(" · ");
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
                              <p className="text-xs font-medium text-ink-400">{config.title.replace(" Management", "")}</p>
                              <p className="mt-0.5 font-rate text-sm font-semibold text-ink-900 dark:text-ink-100">
                                {summary}
                              </p>
                              <p className="mt-1 text-xs text-ink-400">
                                Source: {entry.sourceName} &middot; Approved by {entry.approvedBy}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-ink-400 whitespace-nowrap">{entry.effectiveAt}</span>
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
