import { DeltaBadge } from "@/components/shared/delta-badge";
import type { TrendDirection } from "@/types";

export interface TickerItem {
  label: string;
  value: string;
  percent: number;
  trend: TrendDirection;
}

function TickerRow({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((item) => (
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

export function TickerStrip({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 h-11 border-t border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)] overflow-hidden">
      <div className="flex w-max h-full items-center animate-ticker hover:[animation-play-state:paused]">
        <div className="flex divide-x divide-ink-200 dark:divide-ink-800">
          <TickerRow items={items} />
        </div>
        <div className="flex divide-x divide-ink-200 dark:divide-ink-800" aria-hidden="true">
          <TickerRow items={items} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--surface-muted)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--surface-muted)] to-transparent" />
    </div>
  );
}
