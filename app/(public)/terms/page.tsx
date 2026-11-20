import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | PKRates",
  description: "Terms for using PKRates rate information.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-white">Terms of Use</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          Rates on PKRates are indicative market information collected from named third-party
          sources, shown with their effective timestamps. They are provided for general
          information only and are not financial advice or a quote to buy or sell.
        </p>
        <p>
          Market rates change through the day and can differ between dealers and cities. Always
          confirm the final rate with your dealer, bank, exchange company or fuel pump before
          completing a transaction.
        </p>
        <p>
          While we check every figure against its source before publishing, PKRates is not liable
          for losses arising from decisions made using the information on this site.
        </p>
      </div>
    </div>
  );
}
