"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Command, ArrowRight, TrendingUp } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

const quickLinks = [
  { href: "/gold", label: "Gold Rate Today", group: "Gold" },
  { href: "/gold/karachi", label: "Gold Rate — Karachi", group: "Gold" },
  { href: "/gold/lahore", label: "Gold Rate — Lahore", group: "Gold" },
  { href: "/currency/usd-to-pkr", label: "USD to PKR", group: "Currency" },
  { href: "/currency/aed-to-pkr", label: "AED to PKR", group: "Currency" },
  { href: "/petrol", label: "Petrol Price Today", group: "Fuel" },
  { href: "/crypto/btc", label: "Bitcoin Price in PKR", group: "Crypto" },
  { href: "/prize-bonds", label: "Prize Bond Draw Results", group: "Prize Bonds" },
  { href: "/cement", label: "Cement Rate Today", group: "Cement" },
  { href: "/steel", label: "Steel / Saria Rate Today", group: "Steel" },
];

export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = quickLinks.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="hidden md:flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-[var(--surface)] px-3.5 py-2 text-sm text-ink-400 hover:border-ink-300 dark:hover:border-ink-700 transition-colors"
          aria-label="Search rates"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search rates&hellip;</span>
          <span className="ml-3 flex items-center gap-0.5 rounded border border-ink-200 dark:border-ink-700 px-1.5 py-0.5 text-[10px] font-medium text-ink-400">
            <Command className="h-2.5 w-2.5" />K
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex items-center gap-3 border-b border-ink-200 dark:border-ink-800 px-5 py-4">
          <Search className="h-4 w-4 text-ink-400 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gold, currency, petrol, prize bonds…"
            className="flex-1 bg-transparent text-[15px] text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none"
          />
          <kbd className="hidden sm:block rounded border border-ink-200 dark:border-ink-700 px-1.5 py-0.5 text-[10px] text-ink-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-400">
              No matches for &ldquo;{query}&rdquo;
            </p>
          )}
          {filtered.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors group"
            >
              <span className="flex items-center gap-3">
                <TrendingUp className="h-3.5 w-3.5 text-pulse-500" />
                <span className="text-ink-800 dark:text-ink-100">{link.label}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-ink-400">{link.group}</span>
                <ArrowRight className="h-3.5 w-3.5 text-ink-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
