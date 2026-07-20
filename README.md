# PKRates — Pakistan's Financial Pulse

Phase 1 frontend build: design system, dark/light mode, responsive layout, and a
complete, fully-populated homepage. Built with realistic mock data — **no APIs,
no database** are connected yet, per Phase 1 scope. See the SRS/Technical
Architecture document for how this plugs into Supabase/PostgreSQL in Phase 2+.

## Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (CSS-first `@theme` config — no `tailwind.config.ts` needed)
- **Shadcn-style UI primitives** (hand-rolled on Radix UI, matching shadcn conventions
  so `npx shadcn add <component>` can extend them later)
- **Framer Motion** for hero/entrance micro-interactions
- **next-themes** for dark/light mode

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> This project was authored outside of an npm-connected environment, so
> dependencies have not been installed or build-verified here. Run `npm install`
> then `npm run dev` — if TypeScript flags anything on first compile (typically
> just a stray import), it will be a one-line fix; the component structure and
> Tailwind v4 syntax have been written to current spec.

## Design System

The full token set lives in `app/globals.css` under `@theme`. Highlights:

- **Palette**: "ink" neutrals (warm paper in light mode, near-black in dark) with
  a **pulse green** brand color, **antique gold** for gold-rate emphasis, and
  rise/fall greens & reds for directional data.
- **Type**: `Space Grotesk` for display headings, `IBM Plex Sans` for body text,
  and — the signature detail — `IBM Plex Mono` with tabular numerals (`.font-rate`)
  for every single rate figure on the site, so numbers align like a trading
  terminal rather than reflowing like prose.
- **Signature motif**: `components/shared/pulse-line.tsx` — an animated
  heartbeat-style trace used in the hero and newsletter section, tying back to
  "Financial Pulse" literally but sparingly.
- **Dark/Light mode**: class-based via `next-themes`, toggled in the navbar,
  respects system preference by default, persists across visits.

## Project Structure

```
app/
  layout.tsx        Root layout — fonts, ThemeProvider, Navbar, Footer
  page.tsx           Homepage — assembles all 10 required sections
  globals.css         Design tokens (Tailwind v4 @theme) + base styles
components/
  ui/                 Hand-rolled shadcn-style primitives (Button, Card, Badge, Tabs, Sheet, Tooltip, Separator)
  layout/             Navbar, MobileNav, Footer
  shared/             PulseDot, PulseLine, Sparkline, DeltaBadge, SectionHeading
  home/               One component per homepage section
  theme-provider.tsx / theme-toggle.tsx
lib/
  utils.ts            cn() class merger + PKR/percent formatters
  mock-data.ts         All realistic mock data — swap for live queries in Phase 2
types/
  index.ts             Shared TypeScript interfaces for rate data
```

## Homepage Sections (in order)

1. Hero — headline, search, live "Gold 24K Karachi" stat card with pulse-line chart
2. Ticker strip — auto-scrolling live rate tape beneath the hero
3. Market Overview — 4 headline metric cards (Gold, USD, Petrol, BTC) with sparklines
4. Gold Rates — karat tabs + city cards with 7-day sparklines
5. Currency Rates — Interbank / Open Market tabbed table with buy/sell
6. Petrol Prices — official price cards with effective-date + next-review framing
7. Prize Bonds — draw calendar cards + bond number search input
8. Today's Biggest Moves — top gainers / losers across all categories
9. Category Grid — entry points into all 7 data domains
10. Trust Section — methodology pillars + named data-source partners
11. Newsletter — daily digest signup with working local form state

## v1.1 — Conversion, Trust & Retention Upgrade

A senior-design pass adding the mechanics that make a rates site feel like a
premium market platform (TradingView/Stripe/CoinMarketCap) instead of a
brochure:

- **Shareability** — `ShareButton` on every rate card (hero, market overview,
  gold cards) using the native Web Share API with a clipboard-copy fallback.
  This is the artifact people actually forward in WhatsApp groups.
- **Retention** — `WatchlistButton` (star icon, persists to `localStorage`,
  syncs across the page via a custom event) plus a watchlist counter badge in
  the navbar. Zero backend needed for Phase 1; swap the storage layer for a
  Supabase `user_watchlist` table in Phase 2.
- **Historical comparison** — `HistoricalRangeTabs` (1D/7D/1M/1Y) on every gold
  card, backed by `goldHistoryByRange` mock series, plus an explicit
  "vs Yesterday / vs Last Week / vs Last Month" comparison strip above the
  gold grid — real comparison framing, not just a single sparkline.
- **Market sentiment** — new `MarketSentimentSection` with a CoinMarketCap
  Fear-and-Greed-style gauge (`SentimentGauge`) for an overall mood score, plus
  per-category sentiment chips (Bullish/Bearish/Neutral/Volatile) with a short
  rationale line each.
- **Trust** — a slim `StatusBar` above the navbar ("all sources live, verified
  X minutes ago"), inline "verified 4 min ago" microcopy on the hero stat card,
  and a `SocialProofBar` (daily users, rate checks, source count, freshness)
  directly under the hero.
- **Navigation** — the flat 7-link navbar is now a grouped mega-menu
  (**Markets**: gold/currency/petrol/crypto, **Materials**: cement/steel) plus
  a Stripe/TradingView-style `CommandSearch` (⌘K / Ctrl+K) with quick links to
  every rate page, and a watchlist icon with a live count badge.

New files: `components/shared/{share-button,watchlist-button,sentiment-gauge,
historical-range-tabs}.tsx`, `components/home/{market-sentiment-section,
social-proof-bar}.tsx`, `components/layout/{command-search,status-bar}.tsx`,
`components/ui/dialog.tsx`. `lib/mock-data.ts` extended with
`goldHistoryByRange`, `goldComparison`, `marketSentiment`,
`overallSentimentScore`, `socialProof`.

## v1.2 — Admin Panel (UI/UX only, no database)

A complete internal admin panel, matching the workflow defined in the SRS
(Section 13/14): submit -> pending review -> approve/reject -> published, with
a full audit trail. No Supabase/Postgres wiring yet -- every screen runs on
in-memory mock data and local React state, so approve/reject/submit actions
are fully interactive within a session but reset on reload.

**Route restructure:** the app now has two independent shells via Next.js
route groups -- `app/(public)/layout.tsx` (Navbar/Footer, unchanged from v1.1)
and `app/(admin)/admin/layout.tsx` (sidebar + topbar, no public chrome).
`app/layout.tsx` now only owns fonts and the theme provider.

**Screens built:**

1. **Dashboard** (`/admin`) -- pending-approval counts per domain, flagged-
   anomaly count, freshness SLA warning banner, domains-awaiting-review list,
   recent activity feed.
2-7. **Gold / Currency / Petrol / Prize Bond / Cement / Steel Management**
   (`/admin/{gold,currency,petrol,prize-bonds,cement,steel}`) -- all six share
   one generic, config-driven component (`components/admin/rate-domain-admin.tsx`)
   with three tabs: **Published Rates** (table), **Pending Review** (approve/
   reject with reviewer notes, segregation-of-duty guard against self-approval,
   flagged-anomaly warning callout), and **History**. A "New Submission" form
   renders its fields dynamically from `lib/admin-mock-data.ts`'s
   `domainConfigs`, so the six pages are ~15 lines each -- see that file to
   add an 8th commodity later without touching the workflow component.
8. **Data Source Tracking** (`/admin/sources`) -- reliability-tier stars,
   auto-publish toggle switches, domain coverage badges, contact info.
9. **Audit Log** (`/admin/audit-log`) -- global, filterable by domain/action,
   explicitly labeled append-only (no edit/delete affordance for any role).
10. **Update History** (`/admin/history`) -- a separate, consumer-facing
    vertical timeline of what actually went *live*, grouped by day -- distinct
    from the governance-focused Audit Log which also captures rejections and
    submissions.
11. **Users & Roles** (`/admin/users`) -- role reassignment per user, domain
    assignments, plus a visual permission matrix for all five roles from the
    SRS (Super Admin/Admin/Reviewer/Editor/Analyst).

New files: `types/admin.ts`, `lib/admin-mock-data.ts`,
`components/admin/*` (sidebar, mobile nav, topbar, stat card, status pill,
role badge, activity feed, the generic rate-domain workflow, sources manager,
audit log table, update history timeline, users/roles manager).

## v1.4 — All Public Category Pages

The seven category pages the homepage and navbar always linked to now exist —
`/gold`, `/currency`, `/petrol`, `/crypto`, `/prize-bonds`, `/cement`,
`/steel` — closing the single largest gap flagged in the production-readiness
audit (every nav link previously 404'd except the homepage). Homepage and
admin panel are unchanged, per scope.

**Shared building blocks** (`components/rates/*`), used consistently across
all seven pages rather than one-off per page:

- `breadcrumb.tsx` — Home > Category
- `page-header.tsx` — composes breadcrumb + title + `last-updated.tsx` +
  `source-badge.tsx` + `share-bar.tsx` into one consistent page header
- `share-bar.tsx` — three explicit actions (WhatsApp deep link, Copy Link,
  native Web Share), distinct from the homepage's single smart `ShareButton`
  per the brief's requirement for all three
- `chart-placeholder.tsx` — a labeled 7-day trend chart built on the
  existing `Sparkline`, explicitly marked "illustrative" so it's honest
  about being pre-API rather than presented as live data
- `comparison-table.tsx` — generic vs Yesterday/Last Week/Last Month table,
  reused by Gold/Currency/Petrol/Crypto/Cement/Steel (Prize Bonds uses a
  "Recent Draw History" list instead — a numeric price comparison doesn't
  apply to discrete draw events, so the requirement is met with the
  domain-appropriate equivalent rather than forced onto data it doesn't fit)
- `faq-section.tsx` — accordion FAQ that also emits matching `FAQPage`
  JSON-LD structured data, addressing the SEO audit's missing-structured-data
  finding for these specific pages
- `related-categories.tsx` — links to the other six category pages

**Data additions** in `lib/mock-data.ts`: `cementRates`, `steelRates`, and
`cryptoRates` arrays didn't exist before this version (the homepage only
ever showed single hardcoded headline figures for these) — they're now full
mock datasets. Plus comparison strips and FAQ content per domain.

**Mobile responsiveness note:** the homepage's existing table pattern
(`Card` with `overflow-hidden`) doesn't scroll horizontally on narrow
viewports. Since the homepage itself is out of scope to modify, these new
pages wrap their tables in an additional `overflow-x-auto` container —
an improvement made only in the new code, not a change to the homepage.

**SEO:** every category page has its own `generateMetadata`-equivalent
static `metadata` export (title/description) and FAQ JSON-LD — addressing
two more Critical/High findings from the production-readiness audit for
these specific routes. Sitemap/robots.ts and dynamic city/pair-level routes
are still open items, out of this build's scope.

## v1.5 — Scheduled Refresh Architecture + Anomaly Detection (backend only)

Backend-only release. No file under `app/`, `components/`, or `lib/` was
touched — per scope, the UI, public pages, and admin design are all
unchanged from v1.4. Everything in this release lives under `supabase/`.

**1. Scheduled materialized view refresh** — reviewing the v1.3 migrations
first confirmed no trigger ever actually ran `REFRESH MATERIALIZED VIEW`
directly (the only fact-table trigger just does `pg_notify`), so that part
of the brief was already satisfied structurally. What was missing was a
real implementation of the refresh mechanism itself, previously only
described in a comment. `pg_cron` now runs it on a schedule differentiated
per domain (crypto every minute, everything else every 3 minutes), logged
to a new `view_refresh_log` table, with an Edge Function
(`supabase/functions/refresh-rate-views`) as the near-instant event-driven
complement for when a Database Webhook is configured.

**2. Anomaly Detection System** — `BEFORE INSERT` triggers on Gold,
Currency, Cement, and Steel submissions (the four domains the approved
Data Architecture scoped deviation-checking to) now compute a real
deviation against the last published value, weight it by the source's
existing `reliability_tier`, and — if it exceeds the domain's threshold —
set the submission's status to `flagged_anomaly` instead of leaving it
`pending`. That status already existed in the schema and the admin panel
already rendered it with a warning callout (built earlier, anticipating
this); this release is what actually produces it for a real reason.
Every flagged submission gets a `rate_verifications` row, an `audit_logs`
entry, and a `pg_notify('pkrates_anomaly_flagged', ...)` for the admin
dashboard to subscribe to.

**A bug this surfaced and fixed:** before this release, the approval
triggers and RLS policies only recognized `'pending'` as an actionable
status — a flagged submission would have been visible in the admin queue
but silently un-approvable and un-rejectable. Patched in
`20260719091500_flagged_anomaly_review_patch.sql` by widening that
condition, without changing any table or business rule.

See `supabase/README.md` for full migration-by-migration detail.

## v1.6 — Global Search Fix (no UI redesign)

Fixes a real bug found during review: the ⌘K command palette
(`components/layout/command-search.tsx`) had a hardcoded quick-link list
including hrefs like `/gold/karachi`, `/gold/lahore`, `/currency/usd-to-pkr`,
`/currency/aed-to-pkr`, and `/crypto/btc` — none of which are real routes
(only the 7 flat category pages exist). Clicking any of those 404'd. The
homepage hero search input had no logic behind it at all — pure decoration.

**New:** `lib/search.ts` — a single intent-detection engine, typed so it can
*only* ever return one of the 7 real routes (`ExistingRoute` is a literal
union, not `string`— assigning a href outside that set is a compile error,
not just a convention). Keywords are pulled from the existing mock data
(currency codes, crypto symbols, cement brands, steel grades, gold/cement/
steel cities) rather than re-typed, so search can't silently drift out of
sync with what the app actually shows. Generic words ("rate", "price",
"today") are excluded from matching — this is specifically what makes
"Silver Rate" correctly resolve to "No results found" rather than a false
match on "Gold Rate" (both share the word "rate"; only "gold" is a real
distinguishing keyword).

**New shared pieces**, reused by both search entry points so behavior can't
diverge: `components/shared/use-global-search.ts` (query state, ranked
results, arrow-key navigation, Enter-to-navigate — which is a no-op, not a
guess, when there are zero results) and
`components/shared/search-results-list.tsx` (the suggestion list / "No
results found" rendering, styled with the same tokens already used
elsewhere — no new visual language introduced).

**Changed:** `command-search.tsx` (replaced the hardcoded broken list with
the engine; idle state still browses all 7 categories, matching the
original's default behavior) and `hero-section.tsx` (the search input went
from fully decorative to functional — same markup/classes, now with real
state, keyboard nav, and an autocomplete dropdown). No other visual element
on either component changed; the "View All Rates" button next to the hero
search was deliberately left as-is since it isn't part of the search system.

## v1.7 — Silver (Chandi) Category

Added as a full production category, built only after reviewing the entire
existing architecture first — every piece below reuses an existing system
rather than introducing a parallel one for Silver.

**Database (3 new migrations, all additive):** `silver_purities` /
`silver_rates` / `silver_rate_submissions` mirror Gold's three-table shape
exactly (`purity` in place of `karat`). Silver is wired into every existing
cross-cutting system via `create or replace function` patches to the
functions that already existed — not new parallel versions: the
materialized-view refresh whitelist, the scheduled `pg_cron` batch refresh,
the publish-notify trigger's table→view mapping, and RLS. Anomaly detection
reuses `evaluate_rate_deviation()` and `record_rate_verification()`
unchanged, at the same 4% threshold as Gold (same asset class, same
volatility profile). The `user_domain_access.domain` CHECK constraint (the
one closed enum in the whole schema) was the only constraint needing
`silver` added — found by reviewing every migration for closed domain lists
before writing any code.

**Source reuse, not duplication:** the same Karachi/Lahore/Islamabad/
Peshawar/Quetta Sarafa Associations that already verify Gold also verify
Silver in the real market — the seed migration `UPDATE`s their existing
`sources.domains` array to add `'silver'` rather than inserting 5 near-
duplicate source rows.

**Frontend:** one new public page (`/silver`, structurally identical to
`/gold`, includes OpenGraph metadata — confirmed no page had this yet, so
it's scoped to this page only, not retrofitted onto Gold), one new admin
page (8 lines, pure `RateDomainAdmin` reuse), and a `SilverCityRate` type
(2 purity tiers instead of Gold's 4 karats — the real Pakistani silver
market convention). Everything else — the homepage card, related-categories
sections, search, and the sitemap — required *zero* new components, because
they already read generically from the `categories` array in
`lib/mock-data.ts`; adding one entry to that array is what surfaces Silver
in all of them at once.

**New:** `app/sitemap.ts` — confirmed no sitemap existed anywhere in v1.6
(a known gap from the earlier production-readiness audit). Built once,
site-wide, generated from the same `categories` array so it never needs a
category-specific edit again.

**A stale comment fixed, not a redesign:** `lib/search.ts` used "Silver
Rate" as its worked example of a query that correctly returns "No results
found" (Silver didn't exist yet). Now that it's real, that comment would be
factually wrong, so it was swapped to "Platinum" — which genuinely still
has no PKRates page.

## Notes for Phase 2

- Replace `lib/mock-data.ts` reads with server-side Supabase queries against the
  `current_*_rates` materialized views defined in the SRS — component props and
  shapes were designed to match those view columns closely, minimizing rewrite.
- `ThemeProvider defaultTheme` currently `"light"` with `enableSystem` — adjust
  if product decides to default to system preference.
- Sheet/Tooltip/Tabs primitives are intentionally shadcn-compatible so the real
  `shadcn` CLI can be run later (`npx shadcn@latest init`) without conflicting
  file conventions.
