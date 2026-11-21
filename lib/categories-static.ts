/**
 * The 8 real category pages' static metadata — slug, title,
 * description, and a descriptive label (e.g. "Rs / tola · 24K" —
 * describes what the stat means, not its current value). No live
 * numbers live here; those come from lib/data/rates.ts. This file
 * exists so RelatedCategories, app/sitemap.ts, and lib/search.ts
 * all share one static list instead of three copies, and so
 * RelatedCategories doesn't have to fetch all 8 domains' live
 * rates just to render a lightweight "explore more" widget.
 */
export interface CategoryMeta {
  slug: string;
  title: string;
  description: string;
  headlineLabel: string;
  icon: string;
}

export const CATEGORY_META: CategoryMeta[] = [
  { slug: "gold", title: "Gold Rates", description: "24K, 22K, 21K & 18K — city-wise, updated through the day.", headlineLabel: "Per tola · 24K, Karachi", icon: "coins" },
  { slug: "silver", title: "Silver Rates", description: "999 Fine & 925 Sterling — city-wise, updated through the day.", headlineLabel: "Per tola · 999 Fine, Karachi", icon: "gem" },
  { slug: "currency", title: "Currency Rates", description: "Interbank & open market — buy/sell rates for 15+ currencies.", headlineLabel: "USD / PKR · Interbank sell", icon: "banknote" },
  { slug: "petrol", title: "Petrol Prices", description: "Official OGRA-notified fuel prices, with change history.", headlineLabel: "Rs / litre · Petrol", icon: "fuel" },
  { slug: "crypto", title: "Crypto Prices", description: "Top coins priced live in PKR and USD.", headlineLabel: "Bitcoin (BTC)", icon: "bitcoin" },
  { slug: "prize-bonds", title: "Prize Bonds", description: "Draw results, schedules and bond number search.", headlineLabel: "Next draw calendar", icon: "ticket" },
  { slug: "cement", title: "Cement Rates", description: "Per-bag pricing across major brands and cities.", headlineLabel: "Rs / bag · by brand", icon: "package" },
  { slug: "steel", title: "Steel / Saria Rates", description: "Grade-wise pricing per maund and per ton.", headlineLabel: "Rs / ton · by grade", icon: "layers" },
];
