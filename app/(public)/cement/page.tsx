import type { Metadata } from "next";
import { CategoryPageHeader } from "@/components/rates/page-header";
import { ComparisonTable } from "@/components/rates/comparison-table";
import { ChartPlaceholder } from "@/components/rates/chart-placeholder";
import { FAQSection } from "@/components/rates/faq-section";
import { RelatedCategories } from "@/components/rates/related-categories";
import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { WatchlistButton } from "@/components/shared/watchlist-button";
import { formatPKR } from "@/lib/utils";
import { getCementRates, computeLastUpdatedLabel } from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getCementBrands, getCities } from "@/lib/data/reference";
import { cementFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Cement Price Today in Pakistan — Per Bag Rates | PKRates",
  description:
    "Live cement prices per 50kg bag across major brands — Lucky, DG, Bestway, Fauji, Maple Leaf — and cities in Pakistan, sourced from dealer networks.",
};

export default async function CementRatesPage() {
  const cementRates = await getCementRates();

  if (cementRates.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Cement rates are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }

  const featured = cementRates.find((r) => r.brand === "Lucky Cement" && r.city === "Lahore") ?? cementRates[0];
  const [brands, cities] = await Promise.all([getCementBrands(), getCities()]);
  const brandId = brands.find((b) => b.name === featured.brand)?.id;
  const cityId = cities.find((c) => c.name === featured.city)?.id;
  const comparison = await getComparison(
    "cement_rates", "price_per_bag",
    { brand_id: brandId ?? -1, city_id: cityId ?? -1, status: "published" },
    featured.pricePerBag
  );
  const lastUpdated = computeLastUpdatedLabel(cementRates.map(() => new Date().toISOString()));

  return (
    <>
      <CategoryPageHeader
        title="Cement Price Today"
        description="Per-bag cement pricing across major brands and cities, verified through dealer networks."
        breadcrumbLabel="Cement Rates"
        lastUpdated={lastUpdated}
        source="City Dealer Networks"
        shareText={`${featured.brand} in ${featured.city}: Rs ${formatPKR(featured.pricePerBag)} per bag on PKRates`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Cement Rates by Brand &amp; City
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">Brand</th>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium text-right">Price / Bag (50kg)</th>
                  <th className="px-5 py-3 font-medium text-right">Change</th>
                  <th className="px-5 py-3 font-medium text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {cementRates.map((r) => (
                  <tr key={`${r.brand}-${r.city}`} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-ink-900 dark:text-ink-100">{r.brand}</td>
                    <td className="px-5 py-4 text-ink-600 dark:text-ink-300">{r.city}</td>
                    <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">Rs {formatPKR(r.pricePerBag)}</td>
                    <td className="px-5 py-4 text-right"><DeltaBadge percent={r.changePercent} trend={r.trend} className="ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><WatchlistButton id={`cement-${r.brand.toLowerCase().replace(/\s+/g,'-')}-${r.city.toLowerCase()}`} className="ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title={`${featured.brand} — ${featured.city}`} data={featured.sparkline} unit="PKR per bag" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — {featured.brand}, {featured.city}
            </h2>
            <ComparisonTable
              rows={[
                { label: "vs Yesterday", amount: `${comparison.vsYesterday.amount >= 0 ? "+" : ""}Rs ${formatPKR(comparison.vsYesterday.amount)}`, percent: comparison.vsYesterday.percent, trend: comparison.vsYesterday.trend },
                { label: "vs Last Week", amount: `${comparison.vsLastWeek.amount >= 0 ? "+" : ""}Rs ${formatPKR(comparison.vsLastWeek.amount)}`, percent: comparison.vsLastWeek.percent, trend: comparison.vsLastWeek.trend },
                { label: "vs Last Month", amount: `${comparison.vsLastMonth.amount >= 0 ? "+" : ""}Rs ${formatPKR(comparison.vsLastMonth.amount)}`, percent: comparison.vsLastMonth.percent, trend: comparison.vsLastMonth.trend },
              ]}
            />
          </div>
        </section>

        <FAQSection title="Cement Price FAQs" items={cementFAQs} />
        <RelatedCategories excludeSlug="cement" />
      </div>
    </>
  );
}
