import { socialProof } from "@/lib/mock-data";

export function SocialProofBar() {
  return (
    <div className="border-y border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {socialProof.map((stat) => (
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
