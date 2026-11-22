export const metadata = {
  title: "Contact | PKRates",
  description: "Get in touch with the PKRates team.",
};

const channels = [
  {
    label: "Email",
    value: "hello@pkrates.pk",
    href: "mailto:hello@pkrates.pk",
  },
  {
    label: "X (Twitter)",
    value: "@PkRates1",
    href: "https://x.com/PkRates1",
  },
  {
    label: "Instagram",
    value: "@pkrates1",
    href: "https://instagram.com/pkrates1",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Contact Us
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        Spotted a rate that looks off, have a correction, or a suggestion for PKRates? We&rsquo;d
        like to hear from you. Rate corrections are checked against the named source before
        anything is changed — if you can, tell us which rate, which city, and where you saw the
        different figure.
      </p>

      <div className="mt-8 space-y-4">
        {channels.map((channel) => (
          <div
            key={channel.label}
            className="rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-6"
          >
            <p className="text-sm text-ink-500 dark:text-ink-400">{channel.label}</p>
            <a
              href={channel.href}
              {...(channel.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="mt-1 block text-lg font-medium text-pulse-600 dark:text-pulse-400"
            >
              {channel.value}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-white">
            Data &amp; Permissions
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
            For questions about reusing PKRates data, see our{" "}
            <a href="/license" className="text-pulse-600 dark:text-pulse-400 underline">
              License &amp; Data Usage
            </a>{" "}
            page first, then reach us on any channel above.
          </p>
        </section>
      </div>
    </div>
  );
}
