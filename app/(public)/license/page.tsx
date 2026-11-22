export const metadata = {
  title: "License & Data Usage | PKRates",
  description: "How you may use the rates and content published on PKRates, and where that data comes from.",
};

const attributions = [
  "State Bank of Pakistan (SBP) — official interbank closing rates",
  "National Bank of Pakistan (NBP) — TT buying/selling rates",
  "All Pakistan Sarafa Gems & Jewellers Association (APSGJA) and city Sarafa Association boards — gold & silver rates",
  "Oil and Gas Regulatory Authority (OGRA) — notified petrol, diesel and LPG prices",
  "National Savings Pakistan — prize bond draw schedules and results",
  "Kamran Steel — steel (saria) rates",
];

export default function LicensePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        License &amp; Data Usage
      </h1>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            Data Sources &amp; Attribution
          </h2>
          <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              The rates shown on PKRates are compiled from the following named sources. Full
              details of how each rate is checked before publishing are on our{" "}
              <a href="/sources" className="text-pulse-600 dark:text-pulse-400 underline">
                Sources &amp; Methodology
              </a>{" "}
              page.
            </p>
            <ul className="space-y-1.5">
              {attributions.map((a) => (
                <li key={a} className="flex gap-2">
                  <span className="text-pulse-500">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            Permitted Use
          </h2>
          <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              You may view, save and share the rates on this site for your own personal,
              non-commercial use — for example, checking a rate before a purchase, or sharing a
              rate card with family or friends.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            Prohibited Use
          </h2>
          <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Republishing, redistributing or scraping the data published on PKRates — including
              automated collection of rates for use on another website, app or service — is not
              permitted without our prior written permission.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            Permission Requests
          </h2>
          <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              If you would like to use PKRates data commercially or in another product, please{" "}
              <a href="/contact" className="text-pulse-600 dark:text-pulse-400 underline">
                contact us
              </a>{" "}
              first and we will be happy to discuss it.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            Trademarks
          </h2>
          <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              All source names and trademarks belong to their respective owners. PKRates is an
              independent website and is not affiliated with, or endorsed by, any of the
              institutions named above.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
