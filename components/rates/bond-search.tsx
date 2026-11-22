"use client";

import * as React from "react";
import { Search, Loader2, Trophy } from "lucide-react";
import type { BondSearchResult } from "@/types";

const TIER_LABELS: Record<number, string> = {
  1: "1st Prize",
  2: "2nd Prize",
  3: "3rd Prize",
  4: "4th Prize",
};

/** Bond-number search for the Prize Bonds page. Calls
 * /api/prize-bonds/search and reports every published win for
 * the number, or an honest "no winning record" message. */
export function BondSearch() {
  const [number, setNumber] = React.useState("");
  const [results, setResults] = React.useState<BondSearchResult[] | null>(null);
  const [searched, setSearched] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const digits = number.replace(/\D/g, "");
    if (digits.length < 4) {
      setError("Please enter a valid bond number (digits only).");
      setResults(null);
      return;
    }
    setError(null);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/prize-bonds/search?number=${encodeURIComponent(digits)}`);
      const data = (await res.json()) as { results?: BondSearchResult[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Search failed — please try again.");
        setResults(null);
        return;
      }
      setResults(data.results ?? []);
      setSearched(digits);
    } catch {
      setError("Search failed — please try again.");
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            inputMode="numeric"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Search your bond number, e.g. 290479"
            className="h-12 w-full rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] pl-11 pr-4 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="h-12 shrink-0 rounded-full bg-pulse-600 px-5 text-sm font-medium text-white hover:bg-pulse-700 disabled:opacity-60"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </button>
      </form>
      <p className="mt-2 text-xs text-ink-400">Search checks published results across all denominations and draw dates.</p>

      {error && <p className="mt-3 text-sm text-fall-600 dark:text-red-400">{error}</p>}

      {results !== null && !error && (
        <div className="mt-4 max-w-md">
          {results.length === 0 ? (
            <p className="text-sm text-ink-500 dark:text-ink-400">
              No winning record found for bond number <span className="font-rate font-medium">{searched}</span> in
              published results.
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li
                  key={`${r.drawNumber}-${r.tier}-${i}`}
                  className="flex items-start gap-3 rounded-xl border border-pulse-200 dark:border-pulse-900 bg-pulse-50 dark:bg-pulse-950/40 px-4 py-3"
                >
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-pulse-600 dark:text-pulse-400" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                      {TIER_LABELS[r.tier] ?? `Prize ${r.tier}`}
                      {r.prizeAmount && <> — {r.prizeAmount}</>}
                    </p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      Bond <span className="font-rate">{r.bondNumber}</span> &middot; {r.denomination} &middot; Draw
                      #{r.drawNumber} &middot; {r.city} &middot; {r.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
