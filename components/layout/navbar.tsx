"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandSearch } from "@/components/layout/command-search";
import { useWatchlistCount } from "@/components/shared/watchlist-button";

const navGroups = [
  {
    label: "Markets",
    items: [
      { href: "/gold", label: "Gold Rates", desc: "24K–18K, city-wise" },
      { href: "/silver", label: "Silver Rates", desc: "999 Fine & 925 Sterling" },
      { href: "/currency", label: "Currency Rates", desc: "Interbank & open market" },
      { href: "/petrol", label: "Petrol Prices", desc: "Official OGRA prices" },
      { href: "/crypto", label: "Crypto Prices", desc: "Top coins in PKR" },
    ],
  },
  {
    label: "Materials",
    items: [
      { href: "/cement", label: "Cement Rates", desc: "Per-bag, by brand & city" },
      { href: "/steel", label: "Steel / Saria Rates", desc: "Per maund & per ton" },
    ],
  },
];

const flatLinks = [
  { href: "/prize-bonds", label: "Prize Bonds" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Blog" },
];

function NavGroupMenu({ group }: { group: (typeof navGroups)[number] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
        {group.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 w-64">
          <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-2 shadow-xl">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3.5 py-2.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              >
                <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{item.label}</p>
                <p className="text-xs text-ink-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const watchlistCount = useWatchlistCount();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileLinks = [
    ...navGroups.flatMap((g) => g.items),
    ...flatLinks,
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-ink-200 dark:border-ink-800 bg-[var(--background)]/85 backdrop-blur-md"
          : "border-b border-transparent bg-[var(--background)]/0"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="PKRates logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
            priority
          />
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">
            PK<span className="text-pulse-600 dark:text-pulse-400">Rates</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navGroups.map((group) => (
            <NavGroupMenu key={group.label} group={group} />
          ))}
          {flatLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-600 dark:text-ink-300 hover:text-ink-950 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandSearch />
          <Link
            href="/watchlist"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Your watchlist"
          >
            <Star className="h-[18px] w-[18px]" />
            {watchlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-semibold text-ink-950">
                {watchlistCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
          <Button className="hidden sm:inline-flex" size="sm" asChild>
            <Link href="/#newsletter">Get Rate Alerts</Link>
          </Button>
          <div className="lg:hidden">
            <MobileNav links={mobileLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
