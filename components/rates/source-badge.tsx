import { ShieldCheck } from "lucide-react";

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 dark:border-ink-800 bg-[var(--surface)] px-3 py-1 text-xs text-ink-500 dark:text-ink-400">
      <ShieldCheck className="h-3 w-3 text-pulse-500" />
      Source: <span className="font-medium text-ink-700 dark:text-ink-200">{source}</span>
    </span>
  );
}
