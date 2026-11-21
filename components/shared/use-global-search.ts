"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { searchPKRates, type SearchResult } from "@/lib/search";

/**
 * One shared implementation of "type, see ranked suggestions,
 * arrow-key through them, Enter to go" — used by both the hero
 * search input and the command palette so their behavior can
 * never drift apart. `navigate()` is the ONLY way either caller
 * changes the URL from a search interaction, and it only ever
 * accepts a `SearchResult` produced by `searchPKRates` — which
 * can only ever contain hrefs from lib/search.ts's EXISTING_ROUTES.
 * There is no other code path here that calls router.push.
 */
export function useGlobalSearch(onNavigate?: () => void) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);

  const results = React.useMemo(() => searchPKRates(query), [query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const navigate = React.useCallback(
    (result: SearchResult) => {
      router.push(result.href);
      onNavigate?.();
    },
    [router, onNavigate]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (results.length > 0) setActiveIndex((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (results.length > 0) setActiveIndex((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        // Guaranteed safe: if there are no results, there is
        // nothing to navigate to, so this intentionally does
        // nothing rather than guessing a destination — this is
        // the exact behavior that replaces the old 404 redirect.
        const chosen = results[activeIndex];
        if (chosen) navigate(chosen);
      }
    },
    [results, activeIndex, navigate]
  );

  return { query, setQuery, results, activeIndex, setActiveIndex, handleKeyDown, navigate };
}
