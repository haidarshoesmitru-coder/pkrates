import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About PKRates — Pakistan's Financial Pulse",
  description:
    "PKRates tracks verified, timestamped rates for gold, silver, currency, petrol, crypto, prize bonds, cement and steel across Pakistan.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-white">About PKRates</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          PKRates is Pakistan&rsquo;s Financial Pulse — a single place to check the rates that
          matter every day: gold and silver by city and karat, currency interbank and open-market
          rates, OGRA-notified petrol and diesel prices, crypto prices in PKR, prize bond draws,
          and cement and steel (saria) rates.
        </p>
        <p>
          Every rate on PKRates is tied to a named source and a timestamp. Rates are never
          guessed: where an official source publishes a figure — the State Bank of Pakistan for
          interbank currency, OGRA for fuel, Sarafa associations for gold and silver, National
          Savings for prize bonds — that figure is what we show, with its source named on the page.
        </p>
        <p>
          Gold and silver rates are checked against Sarafa Association boards, currency rates
          follow the State Bank&rsquo;s daily publications on working days, and fuel prices change
          only when OGRA issues a new notification. You can see the full list of sources we use on
          our <Link href="/sources" className="underline underline-offset-2">Sources &amp; Methodology</Link> page.
        </p>
        <p>
          Rates shown are indicative market rates for information only. Always confirm the final
          rate with your dealer, bank or pump before a transaction.
        </p>
      </div>
    </div>
  );
}
