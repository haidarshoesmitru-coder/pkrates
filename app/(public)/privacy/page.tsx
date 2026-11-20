import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PKRates",
  description: "How PKRates handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-white">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          PKRates is a rates-information website. You can browse every rate without creating an
          account, and we do not ask for personal information to show rates.
        </p>
        <p>
          If you subscribe to rate alerts or the newsletter, we use the email address you provide
          only to send those updates, and you can unsubscribe at any time. Watchlist choices are
          stored on your own device.
        </p>
        <p>
          We do not sell personal data. For any privacy question, contact{" "}
          <a href="mailto:hello@pkrates.pk" className="underline underline-offset-2">hello@pkrates.pk</a>.
        </p>
      </div>
    </div>
  );
}
