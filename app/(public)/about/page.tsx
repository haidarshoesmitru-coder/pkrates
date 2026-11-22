export const metadata = {
  title: "About PKRates",
  description: "PKRates is Pakistan's financial pulse — verified, timestamped rates for gold, currency, fuel, crypto, prize bonds, cement and steel.",
};

const sections = [
  {
    heading: "Who We Are",
    body: [
      "PKRates was built around one idea: a Pakistani should be able to check today's gold, currency, petrol, crypto, prize bond, cement and steel rates in one place — with a named source and a timestamp attached to every number, not a guess or a stale board.",
    ],
  },
  {
    heading: "What We Do",
    body: [
      "We track the rates people actually ask about every day — sona chandi, dollar and other currencies, petrol and diesel, prize bond draws, crypto, cement and saria — and publish each one with the source it came from and the time it was last verified. Alongside the rates, our News section carries short updates whenever a board moves, and our Blog explains in plain language how these rates are set.",
    ],
  },
  {
    heading: "Where Our Rates Come From",
    body: [
      "Every rate on PKRates is checked against an official notification, a verified market association, or an established aggregator, and cross-referenced wherever more than one source exists for a category. Our sources include the State Bank of Pakistan (interbank closing rates), the National Bank of Pakistan (TT buying/selling rates), the All Pakistan Sarafa Gems & Jewellers Association and city Sarafa Association boards (gold & silver), OGRA (petrol, diesel and LPG prices), National Savings Pakistan (prize bond draws and results), and Kamran Steel (steel rates). Where no reliable source is available for a given moment, we say so rather than showing a fabricated figure.",
    ],
  },
  {
    heading: "Independent & Unaffiliated",
    body: [
      "PKRates is an independent website. It is not the official website of the State Bank of Pakistan, the National Bank of Pakistan, OGRA, National Savings, Kamran Steel, or any other bank, institution or association it cites as a source, and it is not affiliated with or endorsed by any of them. All institution names belong to their respective owners and are mentioned only to identify where a rate came from.",
    ],
  },
  {
    heading: "Our Editorial Promise",
    body: [
      "We never invent a rate, a city, a source or a date. If a figure cannot be verified against a named source, it is not published. Rates are provided for information only — always confirm the exact rate with your bank, dealer or exchange provider before any transaction.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        About PKRates
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-500 dark:text-ink-400">
        Pakistan&rsquo;s Financial Pulse — verified, timestamped rates in one place.
      </p>
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-12 text-xs text-ink-400 dark:text-ink-500">
        Questions or feedback:{" "}
        <a href="/contact" className="text-pulse-600 dark:text-pulse-400 underline">
          Contact us
        </a>{" "}
        · See also our{" "}
        <a href="/sources" className="text-pulse-600 dark:text-pulse-400 underline">
          Sources &amp; Methodology
        </a>
      </p>
    </div>
  );
}
