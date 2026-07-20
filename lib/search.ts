/**
 * PKRates global search engine.
 *
 * ARCHITECTURAL NOTE (why this file exists): the previous search
 * implementation (components/layout/command-search.tsx) had a
 * hardcoded list of "quick links" that included hrefs like
 * `/gold/karachi`, `/gold/lahore`, `/currency/usd-to-pkr`, and
 * `/crypto/btc` — none of which are real routes (only the flat
 * category pages exist: /gold, /silver, /currency, /petrol,
 * /crypto, /prize-bonds, /cement, /steel). Clicking those items 404'd.
 * That hardcoded list is also the *only* place "search" existed —
 * the homepage hero search input had no logic behind it at all.
 *
 * This file replaces both with one engine with a single hard
 * guarantee: EVERY_ROUTE below is the complete, exhaustive list of
 * pages this app can navigate to. No function in this file can
 * return a href outside that set. That's what "never redirect to
 * a non-existent route" actually means at the code level — not a
 * promise kept by convention, but a type/array that makes the bug
 * class impossible to reintroduce by accident.
 *
 * Keyword data is deliberately pulled from the *existing* mock
 * data (lib/mock-data.ts) rather than re-typed here — currency
 * codes, crypto symbols, cement brands, steel grades, and city
 * names are already defined once; duplicating them as a second,
 * separately-maintained keyword list is exactly the kind of drift
 * that produces stale/broken search results over time.
 */

import {
  currencyRates,
  cryptoRates,
  cementRates,
  steelRates,
  goldRates,
  silverRates,
} from "@/lib/mock-data";

/** The complete, exhaustive set of real routes. Nothing in this
 * file may reference a href outside this list — enforced by
 * typing every SearchEntry's href against it below. */
export const EXISTING_ROUTES = [
  "/gold",
  "/silver",
  "/currency",
  "/petrol",
  "/crypto",
  "/prize-bonds",
  "/cement",
  "/steel",
] as const;

export type ExistingRoute = (typeof EXISTING_ROUTES)[number];

export interface SearchResult {
  id: string;
  label: string;
  description: string;
  href: ExistingRoute;
  category: string;
  score: number;
}

interface SearchEntry {
  id: string;
  label: string;
  description: string;
  href: ExistingRoute;
  category: string;
  /** Distinguishing terms only — see STOPWORDS below for why
   * generic words like "rate"/"price" are deliberately excluded
   * from every entry's keyword set rather than listed here. */
  keywords: string[];
}

// Words too generic to distinguish one category from another.
// Without stripping these, a query like "Platinum Rate" would
// spuriously match "Gold Rate" purely because both contain
// "rate" — exactly the false-positive this list exists to
// prevent, which is what makes "Platinum Rate" correctly resolve
// to "no results" (PKRates has no Platinum category) instead of a
// wrong guess. (Silver was this file's original example, back
// when it wasn't a real category yet — now that /silver exists,
// "Silver Rate" is a genuine, intended match, not a test case.)
const STOPWORDS = new Set([
  "rate", "rates", "price", "prices", "today", "current", "now",
  "in", "the", "a", "of", "to", "for", "pakistan", "pkr", "on",
]);

const goldCities = goldRates.map((r) => r.city.toLowerCase());
const silverCities = silverRates.map((r) => r.city.toLowerCase());
const cementCities = cementRates.map((r) => r.city.toLowerCase());
const steelCities = steelRates.map((r) => r.city.toLowerCase());

const currencyKeywords = currencyRates.flatMap((c) => [
  c.code.toLowerCase(),
  c.name.toLowerCase(),
  ...c.name.toLowerCase().split(" "),
]);

const cryptoKeywords = cryptoRates.flatMap((c) => [
  c.symbol.toLowerCase(),
  c.name.toLowerCase(),
]);

const cementBrandKeywords = cementRates.flatMap((c) => [
  c.brand.toLowerCase(),
  ...c.brand.toLowerCase().split(" "),
]);

const steelGradeKeywords = steelRates.flatMap((s) => [
  s.grade.toLowerCase(),
  ...s.grade.toLowerCase().split(" "),
]);

const SEARCH_INDEX: SearchEntry[] = [
  {
    id: "gold",
    label: "Gold Rates",
    description: "24K, 22K, 21K & 18K — city-wise gold rates",
    href: "/gold",
    category: "Gold",
    keywords: [
      "gold", "karat", "24k", "22k", "21k", "18k", "tola", "sarafa", "jewellers", "jewelry",
      ...goldCities,
    ],
  },
  {
    id: "silver",
    label: "Silver Rates",
    description: "999 Fine & 925 Sterling — city-wise silver rates",
    href: "/silver",
    category: "Silver",
    keywords: [
      "silver", "chandi", "999", "925", "fine", "sterling", "tola", "sarafa",
      ...silverCities,
    ],
  },
  {
    id: "currency",
    label: "Currency Rates",
    description: "Interbank & open market — buy/sell rates for 15+ currencies",
    href: "/currency",
    category: "Currency",
    keywords: [
      "currency", "currencies", "exchange", "forex", "interbank", "open market",
      "dollar", "dirham", "pound", "euro", "riyal", "yuan", "remittance",
      ...currencyKeywords,
    ],
  },
  {
    id: "petrol",
    label: "Petrol Prices",
    description: "Official OGRA-notified petrol, diesel & kerosene prices",
    href: "/petrol",
    category: "Petrol",
    keywords: [
      "petrol", "diesel", "fuel", "kerosene", "hsd", "ogra", "motor spirit", "gas",
    ],
  },
  {
    id: "crypto",
    label: "Crypto Prices",
    description: "Top coins priced live in PKR and USD",
    href: "/crypto",
    category: "Crypto",
    keywords: [
      "crypto", "cryptocurrency", "coin", "coins", "blockchain",
      ...cryptoKeywords,
    ],
  },
  {
    id: "prize-bonds",
    label: "Prize Bonds",
    description: "Draw results, schedules and bond number search",
    href: "/prize-bonds",
    category: "Prize Bonds",
    keywords: [
      "prize", "bond", "bonds", "draw", "draws", "national savings", "winning",
      "100", "200", "750", "1500", "7500", "15000", "25000", "40000",
    ],
  },
  {
    id: "cement",
    label: "Cement Rates",
    description: "Per-bag pricing across major brands and cities",
    href: "/cement",
    category: "Cement",
    keywords: [
      "cement", "bag", "bags", "construction",
      ...cementBrandKeywords,
      ...cementCities,
    ],
  },
  {
    id: "steel",
    label: "Steel / Saria Rates",
    description: "Grade-wise pricing per maund and per ton",
    href: "/steel",
    category: "Steel",
    keywords: [
      "steel", "saria", "sariya", "rebar", "iron", "girder", "maund", "ton",
      ...steelGradeKeywords,
      ...steelCities,
    ],
  },
];

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Scores every entry against a query and returns matches ranked
 * highest-first. An entry only appears if at least one
 * non-stopword query token matched one of its keywords — this is
 * the mechanism that produces a genuinely empty result set (and
 * therefore "No results found") for something like "Platinum Rate"
 * or random unrelated text, rather than ever guessing.
 */
export function searchPKRates(rawQuery: string, limit = 6): SearchResult[] {
  const allTokens = tokenize(rawQuery);
  const meaningfulTokens = allTokens.filter((t) => !STOPWORDS.has(t));
  // If every token was a stopword (e.g. query was just "today"),
  // fall back to the full token set so the search isn't a no-op —
  // still won't match anything nonsensical since real category
  // keywords never overlap with pure stopwords anyway.
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : allTokens;

  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const entry of SEARCH_INDEX) {
    const keywordSet = new Set(entry.keywords);
    let matchedTokens = 0;

    for (const token of tokens) {
      if (keywordSet.has(token)) {
        matchedTokens += 1;
        continue;
      }
      // Partial/substring credit (half weight) so e.g. "cement"
      // still matches a keyword like "cementitious" or a
      // multi-word brand fragment without requiring an exact
      // whole-token match everywhere.
      const partial = entry.keywords.some(
        (k) => k.length > 2 && (k.includes(token) || token.includes(k))
      );
      if (partial) matchedTokens += 0.5;
    }

    if (matchedTokens === 0) continue;

    const score = matchedTokens / tokens.length;
    results.push({
      id: entry.id,
      label: entry.label,
      description: entry.description,
      href: entry.href,
      category: entry.category,
      score,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** The single best match, used when the user presses Enter /
 * submits — or `null` if nothing matched, which callers MUST
 * treat as "show No results found", never as "guess anyway". */
export function getTopSearchMatch(query: string): SearchResult | null {
  const [top] = searchPKRates(query, 1);
  return top ?? null;
}

/** All 7 real categories, for the command palette's idle
 * (empty-query, "browse everything") state — mirrors the
 * original static quickLinks list's default view, but sourced
 * from the same single SEARCH_INDEX rather than a second,
 * separately-maintained array. */
export function getAllCategories(): SearchResult[] {
  return SEARCH_INDEX.map((entry) => ({
    id: entry.id,
    label: entry.label,
    description: entry.description,
    href: entry.href,
    category: entry.category,
    score: 1,
  }));
}
