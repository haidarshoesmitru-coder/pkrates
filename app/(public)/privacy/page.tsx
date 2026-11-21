export const metadata = {
  title: "Privacy Policy | PKRates",
  description: "How PKRates handles visitor data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Privacy Policy
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        <p>
          PKRates does not require an account to browse rates. Your watchlist (rates you star)
          is saved only in your own browser&rsquo;s local storage and is never sent to our
          servers or shared with anyone.
        </p>
        <p>
          If you subscribe to our daily digest, we store your email address solely to send that
          digest and never share it with third parties. You can unsubscribe at any time via the
          link in any email we send.
        </p>
        <p>
          We may use standard, privacy-respecting analytics to understand which pages are useful,
          without tracking you individually across other websites.
        </p>
      </div>
      <p className="mt-10 text-xs text-ink-400 dark:text-ink-500">
        Questions about this policy:{" "}
        <a href="mailto:hello@pkrates.pk" className="text-pulse-600 dark:text-pulse-400 underline">
          hello@pkrates.pk
        </a>
      </p>
    </div>
  );
}
