"use client";

import { Search as SearchIcon, ArrowRight, TrendingUp } from "lucide-react";
import type { SearchResult } from "@/lib/search";
import { cn } from "@/lib/utils";

/**
 * Renders either the ranked suggestion list or a "No results
 * found" state — never nothing, and never a link to a route that
 * isn't in `results` (which itself can only ever contain hrefs
 * from lib/search.ts's EXISTING_ROUTES). This is the component
 * that satisfies "Show 'No results found' instead of a 404 page":
 * a query with zero matches renders this message and stops there
 * — there is no code path in either caller that navigates when
 * `results` is empty.
 */
export function SearchResultsList({
  query,
  results,
  activeIndex,
  onSelect,
  className,
}: {
  query: string;
  results: SearchResult[];
  activeIndex?: number;
  onSelect: (result: SearchResult) => void;
  className?: string;
}) {
  if (results.length === 0) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <SearchIcon className="h-5 w-5 mx-auto text-ink-300 dark:text-ink-700" />
        <p className="mt-2 text-sm font-medium text-ink-600 dark:text-ink-300">
          No results found for &ldquo;{query}&rdquo;
        </p>
        <p className="mt-1 text-xs text-ink-400">
          Try Gold, Currency, Petrol, Crypto, Prize Bonds, Cement, or Steel.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("py-2", className)}>
      {results.map((result, i) => (
        <button
          key={result.id}
          type="button"
          onClick={() => onSelect(result)}
          className={cn(
            "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors",
            i === activeIndex
              ? "bg-ink-100 dark:bg-ink-800"
              : "hover:bg-ink-100 dark:hover:bg-ink-800"
          )}
        >
          <span className="flex items-center gap-3 min-w-0">
            <TrendingUp className="h-3.5 w-3.5 text-pulse-500 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink-900 dark:text-ink-100 truncate">
                {result.label}
              </span>
              <span className="block text-xs text-ink-400 truncate">{result.description}</span>
            </span>
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-ink-400">{result.category}</span>
            <ArrowRight className="h-3.5 w-3.5 text-ink-300 dark:text-ink-600" />
          </span>
        </button>
      ))}
    </div>
  );
}
