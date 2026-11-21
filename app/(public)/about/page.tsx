export const metadata = {
  title: "About PKRates",
  description: "PKRates is Pakistan's financial pulse — verified, timestamped rates for gold, currency, fuel, crypto, prize bonds, cement and steel.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        About PKRates
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          PKRates was built around one idea: a Pakistani should be able to check today&rsquo;s
          gold, currency, petrol, crypto, prize bond, cement and steel rates in one place — with a
          named source and a timestamp attached to every number, not a guess or a stale board.
        </p>
        <p>
          Every rate published here is checked against an official notification, a verified market
          association, or an established aggregator, and cross-referenced wherever more than one
          source exists for a category. Where no reliable source is available for a given moment,
          we say so rather than showing a fabricated figure.
        </p>
        <p>
          PKRates is independently run and is not affiliated with the State Bank of Pakistan,
          OGRA, National Savings, or any bank or association it cites as a source.
        </p>
      </div>
      <p className="mt-10 text-xs text-ink-400 dark:text-ink-500">
        Questions or feedback:{" "}
        <a href="mailto:hello@pkrates.pk" className="text-pulse-600 dark:text-pulse-400 underline">
          hello@pkrates.pk
        </a>
      </p>
    </div>
  );
}
