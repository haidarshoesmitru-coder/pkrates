"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const ranges = ["1D", "7D", "1M", "1Y"] as const;
export type HistoricalRange = (typeof ranges)[number];

export function HistoricalRangeTabs({
  value,
  onChange,
  className,
}: {
  value: HistoricalRange;
  onChange: (range: HistoricalRange) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-full bg-ink-100 dark:bg-ink-900 p-0.5", className)}>
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium font-rate transition-colors",
            value === r
              ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-sm"
              : "text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
