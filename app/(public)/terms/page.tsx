export const metadata = {
  title: "Terms & Conditions | PKRates",
  description: "Terms and conditions for using the PKRates website.",
};

const sections = [
  {
    heading: "1. Acceptance of Terms",
    body: [
      "By accessing or using PKRates, you agree to these Terms & Conditions. If you do not agree with any part of them, please do not use this website.",
    ],
  },
  {
    heading: "2. What PKRates Provides",
    body: [
      "PKRates publishes market rates for gold, silver, currencies, petrol and diesel, crypto, prize bonds, cement and steel in Pakistan, together with related news updates and explanatory guides. Rates are compiled from the named third-party sources shown alongside each rate — see our Sources & Methodology page for details.",
    ],
  },
  {
    heading: "3. Accuracy of Rates",
    body: [
      "Rates published on PKRates are indicative and are provided for informational purposes only. They are not an offer to buy or sell anything, and they are not a substitute for confirming the exact rate with your bank, dealer, jeweller or exchange provider before any transaction. Market rates can change at any time, and the rate quoted to you at the time of your transaction is the one that applies.",
    ],
  },
  {
    heading: "4. No Liability",
    body: [
      "PKRates makes reasonable efforts to keep rates accurate and up to date, but does not guarantee their completeness or accuracy at any given moment. To the fullest extent permitted by law, PKRates is not liable for any loss or decision arising from reliance on rates or content shown on this site.",
    ],
  },
  {
    heading: "5. Data & Content Use",
    body: [
      "Content on this site may not be reproduced, redistributed or scraped without permission, except for personal, non-commercial reference. The full rules are set out on our License & Data Usage page.",
    ],
  },
  {
    heading: "6. Changes to These Terms",
    body: [
      "We may update, change or remove content on this site — including these terms — at any time without notice. Continued use of the site after a change means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Terms &amp; Conditions
      </h1>
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
        Questions about these terms:{" "}
        <a href="mailto:hello@pkrates.pk" className="text-pulse-600 dark:text-pulse-400 underline">
          hello@pkrates.pk
        </a>{" "}
        ·{" "}
        <a href="/license" className="text-pulse-600 dark:text-pulse-400 underline">
          License &amp; Data Usage
        </a>
      </p>
    </div>
  );
}
