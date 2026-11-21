"use client";

import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

const STORAGE_KEY = "pkrates:watchlist";

const CATEGORY_MAP: { prefix: string; label: string; href: string }[] = [
  { prefix: "prize-bonds", label: "Prize Bonds", href: "/prize-bonds" },
  { prefix: "gold", label: "Gold", href: "/gold" },
  { prefix: "silver", label: "Silver", href: "/silver" },
  { prefix: "currency", label: "Currency", href: "/currency" },
  { prefix: "petrol", label: "Petrol", href: "/petrol" },
  { prefix: "crypto", label: "Crypto", href: "/crypto" },
  { prefix: "cement", label: "Cement", href: "/cement" },
  { prefix: "steel", label: "Steel", href: "/steel" },
];

function parseWatchItem(id: string) {
  const match = CATEGORY_MAP.find((c) => id.startsWith(c.prefix + "-"));
  if (!match) return { category: "Other", detail: id, href: "/" };
  const detail = id
    .slice(match.prefix.length + 1)
    .split("-")
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
  return { category: match.label, detail, href: match.href };
}

export default function WatchlistPage() {
  const [ids, setIds] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    function load() {
      try {
        setIds(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"));
      } catch {
        setIds([]);
      }
    }
    load();
    window.addEventListener("pkrates:watchlist-change", load);
    return () => window.removeEventListener("pkrates:watchlist-change", load);
  }, []);

  function remove(id: string) {
    const next = (ids ?? []).filter((x) => x !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("pkrates:watchlist-change"));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        Your Watchlist
      </h1>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        Rates you&rsquo;ve starred, saved only in this browser.
      </p>

      {ids === null ? null : ids.length === 0 ? (
        <div className="mt-10 rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-10 text-center">
          <Star className="mx-auto h-8 w-8 text-ink-300 dark:text-ink-600" />
          <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
            Nothing starred yet. Tap the star next to any rate to add it here.
          </p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-ink-200 dark:divide-ink-800 rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)]">
          {ids.map((id) => {
            const { category, detail, href } = parseWatchItem(id);
            return (
              <div key={id} className="flex items-center justify-between px-5 py-4">
                <Link href={href} className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-ink-400">{category}</p>
                  <p className="font-medium text-ink-900 dark:text-ink-100 truncate">{detail}</p>
                </Link>
                <button
                  onClick={() => remove(id)}
                  className="ml-4 shrink-0 text-xs text-ink-400 hover:text-fall-600 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
