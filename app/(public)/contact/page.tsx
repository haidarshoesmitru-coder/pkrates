export const metadata = {
  title: "Contact | PKRates",
  description: "Get in touch with the PKRates team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Contact
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        Spotted a rate that looks off, have a correction, or a suggestion for PKRates? We&rsquo;d
        like to hear from you.
      </p>
      <div className="mt-8 rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-6">
        <p className="text-sm text-ink-500 dark:text-ink-400">Email</p>
        <a href="mailto:hello@pkrates.pk" className="mt-1 block text-lg font-medium text-pulse-600 dark:text-pulse-400">
          hello@pkrates.pk
        </a>
      </div>
    </div>
  );
}
