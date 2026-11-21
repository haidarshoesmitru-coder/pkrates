export interface SocialProofStat {
  value: string;
  label: string;
}

/**
 * Two of these four stats are genuinely derivable from Supabase
 * (verified source count, data freshness) and are computed by the
 * caller from real queries. "Daily active users" and "rate checks
 * this month" have no corresponding analytics/usage-tracking table
 * in the schema (no such tracking exists yet), so they remain
 * static marketing copy passed in by the page — same category as
 * a tagline, not fabricated rate data.
 */
export function SocialProofBar({ stats }: { stats: SocialProofStat[] }) {
  return (
    <div className="border-y border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-rate text-xl sm:text-2xl font-semibold text-ink-950 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
