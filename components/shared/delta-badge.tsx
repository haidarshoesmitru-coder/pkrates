import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn, formatDelta } from "@/lib/utils";
import type { TrendDirection } from "@/types";

export function DeltaBadge({
  percent,
  trend,
  className,
}: {
  percent: number;
  trend: TrendDirection;
  className?: string;
}) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium font-rate",
        trend === "up" && "bg-pulse-50 text-rise-600 dark:bg-pulse-950/50 dark:text-pulse-300",
        trend === "down" && "bg-red-50 text-fall-600 dark:bg-red-950/40 dark:text-red-300",
        trend === "flat" && "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {formatDelta(percent)}
    </span>
  );
}
