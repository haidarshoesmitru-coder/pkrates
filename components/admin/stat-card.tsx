import type { ComponentType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger" | "success";
  hint?: string;
}) {
  const toneClass = {
    default: "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300",
    warning: "bg-gold-50 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300",
    danger: "bg-red-50 dark:bg-red-950/40 text-fall-600 dark:text-red-300",
    success: "bg-pulse-50 dark:bg-pulse-950/50 text-rise-600 dark:text-pulse-300",
  }[tone];

  return (
    <Card className="p-5">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", toneClass)}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 font-rate text-2xl font-semibold text-ink-950 dark:text-white">{value}</p>
      <p className="text-xs text-ink-500 dark:text-ink-400">{label}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
    </Card>
  );
}
