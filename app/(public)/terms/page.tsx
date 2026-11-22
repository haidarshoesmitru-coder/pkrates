export const metadata = {
  title: "Terms of Use | PKRates",
  description: "Terms of use for the PKRates website.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Terms of Use
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          Rates published on PKRates are indicative and sourced from the named third parties
          shown alongside each rate — see our{" "}
          <a href="/sources" className="text-pulse-600 dark:text-pulse-400 underline">
            Sources & Methodology
          </a>{" "}
          page for details. They are provided for informational purposes only and should not be
          treated as a substitute for confirming the exact rate with your bank, dealer, or
          exchange provider before any transaction.
        </p>
        <p>
          PKRates makes reasonable efforts to keep rates accurate and up to date, but does not
          guarantee their completeness or accuracy at any given moment, and is not liable for any
          decision made based on rates shown on this site. Market rates can change at any time,
          and the rate you are quoted by your bank, dealer or exchange provider at the time of
          your transaction is the one that applies.
        </p>
        <p>
          We may update, change or remove content on this site — including these terms — at any
          time without notice. Continued use of the site after a change means you accept the
          updated terms.
        </p>
        <p>
          Content on this site may not be reproduced or redistributed without permission, except
          for personal, non-commercial reference.
        </p>
      </div>
      <p className="mt-10 text-xs text-ink-400 dark:text-ink-500">
        Questions about these terms:{" "}
        <a href="mailto:hello@pkrates.pk" className="text-pulse-600 dark:text-pulse-400 underline">
          hello@pkrates.pk
        </a>
      </p>
    </div>
  );
}
