import Link from "next/link";
import { Activity, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const columns = [
  {
    title: "Rates",
    links: [
      { href: "/gold", label: "Gold Rates" },
      { href: "/currency", label: "Currency Rates" },
      { href: "/petrol", label: "Petrol Prices" },
      { href: "/crypto", label: "Crypto Prices" },
    ],
  },
  {
    title: "Markets",
    links: [
      { href: "/prize-bonds", label: "Prize Bonds" },
      { href: "/cement", label: "Cement Rates" },
      { href: "/steel", label: "Steel / Saria Rates" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/sources", label: "Our Sources & Methodology" },
      { href: "/about", label: "About PKRates" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-600 text-white">
                <Activity className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight">
                PK<span className="text-pulse-600 dark:text-pulse-400">Rates</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Pakistan&rsquo;s Financial Pulse — verified, timestamped rates for gold,
              currency, fuel, crypto, prize bonds, cement and steel.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="col-span-1 md:col-span-1">
              <h4 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-500 dark:text-ink-400 hover:text-pulse-600 dark:hover:text-pulse-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
              Stay Updated
            </h4>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">
              Get today&rsquo;s biggest rate moves in your inbox.
            </p>
            <a
              href="mailto:hello@pkrates.pk"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-pulse-600 dark:text-pulse-400"
            >
              <Mail className="h-3.5 w-3.5" />
              hello@pkrates.pk
            </a>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-400 dark:text-ink-500">
            &copy; {new Date().getFullYear()} PKRates. All rates are indicative and sourced from
            named third parties — see our{" "}
            <Link href="/sources" className="underline underline-offset-2 hover:text-pulse-600">
              methodology
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-400 dark:text-ink-500">
            <Link href="/about" className="hover:text-ink-700 dark:hover:text-ink-200">
              About
            </Link>
            <Link href="/contact" className="hover:text-ink-700 dark:hover:text-ink-200">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-ink-700 dark:hover:text-ink-200">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink-700 dark:hover:text-ink-200">
              Terms
            </Link>
            <Link href="/license" className="hover:text-ink-700 dark:hover:text-ink-200">
              License
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
