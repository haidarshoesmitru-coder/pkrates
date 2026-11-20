import type { Metadata } from "next";
import { getActiveSources } from "@/lib/data/reference";

export const metadata: Metadata = {
  title: "Our Sources & Methodology | PKRates",
  description:
    "How PKRates collects and verifies rates — named sources for gold, currency, fuel, crypto, prize bonds, cement and steel.",
};

export default async function SourcesPage() {
  let sources: Awaited<ReturnType<typeof getActiveSources>> = [];
  try {
    sources = await getActiveSources();
  } catch {
    sources = [];
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-white">
        Our Sources &amp; Methodology
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          PKRates never invents a rate. Every figure comes from a named source, is checked before
          publishing, and carries the time it took effect. If a source has not published a new
          figure, the last verified figure stays up with its original timestamp — it is never
          quietly refreshed to look new.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Gold &amp; silver:</strong> Sarafa Association boards, city by city.</li>
          <li><strong>Currency (interbank):</strong> State Bank of Pakistan daily publications.</li>
          <li><strong>Petrol &amp; diesel:</strong> OGRA price notifications, effective from the notified date.</li>
          <li><strong>Prize bonds:</strong> National Savings draw schedule and official result files.</li>
          <li><strong>Cement &amp; steel:</strong> named dealer and mill price lists, labelled with their source.</li>
          <li><strong>Crypto:</strong> market prices converted to PKR at the prevailing dollar rate.</li>
        </ul>
        <p>
          New submissions pass through a review step before they appear on the site, and large
          deviations from the previous published rate are flagged for a second look instead of
          publishing automatically.
        </p>
      </div>

      {sources.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Active Sources
          </h2>
          <ul className="divide-y divide-ink-200 dark:divide-ink-800 rounded-xl border border-ink-200 dark:border-ink-800">
            {sources.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
                <span className="font-medium text-ink-900 dark:text-ink-100">{s.name}</span>
                <span className="text-xs uppercase tracking-wide text-ink-400">
                  {s.domains.map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
