import { PulseDot } from "@/components/shared/pulse-dot";

export function LastUpdated({ timestamp }: { timestamp: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-[var(--surface)] px-3 py-1 text-xs text-ink-500 dark:text-ink-400">
      <PulseDot />
      Last updated: <span className="font-rate font-medium text-ink-700 dark:text-ink-200">{timestamp}</span>
    </span>
  );
}
