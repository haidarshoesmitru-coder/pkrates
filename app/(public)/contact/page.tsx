import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact PKRates",
  description: "Contact the PKRates team about rates, corrections or partnerships.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-white">Contact Us</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          Spotted a rate that looks wrong, or a source we should be tracking? Write to us — every
          correction report is checked against the named source before anything changes.
        </p>
        <a
          href="mailto:hello@pkrates.pk"
          className="inline-flex items-center gap-2 font-medium text-pulse-600 dark:text-pulse-400"
        >
          <Mail className="h-4 w-4" /> hello@pkrates.pk
        </a>
      </div>
    </div>
  );
}
