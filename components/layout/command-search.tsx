"use client";

import * as React from "react";
import { Search, Command } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { SearchResultsList } from "@/components/shared/search-results-list";
import { useGlobalSearch } from "@/components/shared/use-global-search";
import { getAllCategories } from "@/lib/search";

/**
 * FIX (see lib/search.ts for the full explanation): this
 * component previously held a hardcoded `quickLinks` array with
 * hrefs like `/gold/karachi` and `/crypto/btc` that don't exist
 * as real pages — clicking them 404'd. It now delegates all
 * matching to `searchPKRates()`, which can only ever return the
 * 7 routes that actually exist, and renders results through the
 * same `SearchResultsList` the hero search uses, so "no results"
 * and "here are your matches" look and behave identically
 * everywhere in the app.
 */
export function CommandSearch() {
  const [open, setOpen] = React.useState(false);
  const { query, setQuery, results, activeIndex, handleKeyDown, navigate } =
    useGlobalSearch(() => setOpen(false));

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

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open, setQuery]);

  // Idle state (no query yet) browses all 7 real categories —
  // the same "show everything by default" behavior the old
  // static list had, just sourced from the one shared index.
  const displayResults = query.trim().length === 0 ? getAllCategories() : results;

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
            onKeyDown={handleKeyDown}
            placeholder="Search gold, currency, petrol, prize bonds…"
            className="flex-1 bg-transparent text-[15px] text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none"
          />
          <kbd className="hidden sm:block rounded border border-ink-200 dark:border-ink-700 px-1.5 py-0.5 text-[10px] text-ink-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          <SearchResultsList
            query={query}
            results={displayResults}
            activeIndex={activeIndex}
            onSelect={navigate}
            className="p-2"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
