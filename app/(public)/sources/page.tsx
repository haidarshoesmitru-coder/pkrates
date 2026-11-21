export const metadata = {
  title: "Our Sources & Methodology | PKRates",
  description: "Where PKRates' rates come from, and how each one is verified before it's published.",
};

const sourceGroups = [
  {
    category: "Gold & Silver",
    sources: [
      "Sarafa.pk (city-wise aggregator API, cross-checked against local Sarafa Association boards)",
      "Karachi, Lahore, Islamabad, Peshawar & Quetta Sarafa Associations",
    ],
  },
  {
    category: "Currency",
    sources: [
      "State Bank of Pakistan — official interbank closing rate",
      "National Bank of Pakistan — TT buying/selling rates",
      "Forex Association of Pakistan — open market rates",
      "Global Market Rate (exchangerate-api.com) — used only as a backup when a manual rate hasn't been updated recently",
    ],
  },
  {
    category: "Petrol & Diesel",
    sources: ["OGRA (Oil and Gas Regulatory Authority) — official notified prices"],
  },
  {
    category: "Crypto",
    sources: ["CoinGecko API — refreshed automatically several times a day"],
  },
  {
    category: "Prize Bonds",
    sources: ["National Savings Pakistan — official draw schedules and results"],
  },
  {
    category: "Cement & Steel",
    sources: ["Local dealer and distributor networks across major cities"],
  },
];

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Our Sources & Methodology
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        Every rate on PKRates carries a named source — never an anonymous number. Rates are
        checked against official notifications, verified market associations, and — where no
        single official source exists — cross-checked against multiple independent boards before
        being published.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        If a rate is unavailable from any of our sources, we show it as unavailable rather than
        estimate or carry forward a stale number.
      </p>

      <div className="mt-10 space-y-8">
        {sourceGroups.map((group) => (
          <div key={group.category}>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
              {group.category}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {group.sources.map((s) => (
                <li key={s} className="text-sm text-ink-600 dark:text-ink-300 flex gap-2">
                  <span className="text-pulse-500">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs text-ink-400 dark:text-ink-500">
        Have a correction, or know a more authoritative source for any category? Reach us at{" "}
        <a href="mailto:hello@pkrates.pk" className="text-pulse-600 dark:text-pulse-400 underline">
          hello@pkrates.pk
        </a>
        .
      </p>
    </div>
  );
}
