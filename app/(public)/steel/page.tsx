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
import { getSteelRates, computeLastUpdatedLabel } from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getSteelGrades, getCities } from "@/lib/data/reference";
import { steelFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Steel / Saria Rate Today in Pakistan — Per Maund & Ton | PKRates",
  description:
    "Live Grade 40 and Grade 60 steel/saria rates per maund and per ton across major Pakistani cities, sourced from Steel Melters and Re-Rolling Mills Associations.",
};

export default async function SteelRatesPage() {
  try {
  const steelRates = await getSteelRates();

  if (steelRates.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Steel rates are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }

  const featured = steelRates.find((r) => r.grade === "Grade 60" && r.city === "Karachi") ?? steelRates[0];
  const [grades, cities] = await Promise.all([getSteelGrades(), getCities()]);
  const gradeId = grades.find((g) => g.label === featured.grade)?.id;
  const cityId = cities.find((c) => c.name === featured.city)?.id;
  const comparison = await getComparison(
    "steel_rates", "price_per_ton",
    { grade_id: gradeId ?? -1, city_id: cityId ?? -1, status: "published" },
    featured.pricePerTon
  );
  const lastUpdated = computeLastUpdatedLabel(steelRates.map((r) => r.effectiveAt));

  return (
    <>
      <CategoryPageHeader
        title="Steel / Saria Rate Today"
        description="Grade-wise steel and saria pricing per maund and per ton, verified through mill and dealer networks."
        breadcrumbLabel="Steel / Saria Rates"
        lastUpdated={lastUpdated}
        source="Steel Melters Association"
        shareText={`${featured.grade} Saria in ${featured.city}: Rs ${formatPKR(featured.pricePerTon)} per ton on PKRates`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Steel Rates by Grade &amp; City
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="sticky left-0 z-10 w-24 truncate px-5 py-3 font-medium bg-ink-50 dark:bg-ink-900">Grade</th>
                  <th className="sticky left-24 z-10 px-5 py-3 font-medium bg-ink-50 dark:bg-ink-900">City</th>
                  <th className="px-5 py-3 font-medium text-right">Per Maund</th>
                  <th className="px-5 py-3 font-medium text-right">Per Ton</th>
                  <th className="px-5 py-3 font-medium text-right">Change</th>
                  <th className="px-5 py-3 font-medium text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {steelRates.map((r) => (
                  <tr key={`${r.grade}-${r.city}`} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    <td className="sticky left-0 z-10 w-24 truncate px-5 py-4 font-medium text-ink-900 dark:text-ink-100 bg-[var(--surface)]">{r.grade}</td>
                    <td className="sticky left-24 z-10 px-5 py-4 text-ink-600 dark:text-ink-300 bg-[var(--surface)]">{r.city}</td>
                    <td className="px-5 py-4 text-right font-rate text-ink-700 dark:text-ink-200">Rs {formatPKR(r.pricePerMaund)}</td>
                    <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">Rs {formatPKR(r.pricePerTon)}</td>
                    <td className="px-5 py-4 text-right"><DeltaBadge percent={r.changePercent} trend={r.trend} className="ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><WatchlistButton id={`steel-${r.grade.toLowerCase().replace(/\s+/g,'-')}-${r.city.toLowerCase()}`} className="ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title={`${featured.grade} Saria — ${featured.city}`} data={featured.sparkline} unit="PKR per ton" positive={featured.trend !== "down"} />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — {featured.grade}, {featured.city}
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

        <FAQSection title="Steel / Saria Rate FAQs" items={steelFAQs} />
        <RelatedCategories excludeSlug="steel" />
      </div>
    </>
  );
  } catch (err) {
    console.error("[steel page error]", err);
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Steel rates are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }
}
