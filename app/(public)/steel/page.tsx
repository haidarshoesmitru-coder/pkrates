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
import { steelRates, steelComparison, steelFAQs, lastUpdated } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Steel / Saria Rate Today in Pakistan — Per Maund & Ton | PKRates",
  description:
    "Live Grade 40 and Grade 60 steel/saria rates per maund and per ton across major Pakistani cities, sourced from Steel Melters and Re-Rolling Mills Associations.",
};

export default function SteelRatesPage() {
  return (
    <>
      <CategoryPageHeader
        title="Steel / Saria Rate Today"
        description="Grade-wise steel and saria pricing per maund and per ton, verified through mill and dealer networks."
        breadcrumbLabel="Steel / Saria Rates"
        lastUpdated={lastUpdated}
        source="Steel Melters Association"
        shareText={`Grade 60 Saria in Karachi: Rs ${formatPKR(steelRates[0].pricePerTon)} per ton on PKRates`}
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
                  <th className="px-5 py-3 font-medium">Grade</th>
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium text-right">Per Maund</th>
                  <th className="px-5 py-3 font-medium text-right">Per Ton</th>
                  <th className="px-5 py-3 font-medium text-right">Change</th>
                  <th className="px-5 py-3 font-medium text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {steelRates.map((r) => (
                  <tr key={`${r.grade}-${r.city}`} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-ink-900 dark:text-ink-100">{r.grade}</td>
                    <td className="px-5 py-4 text-ink-600 dark:text-ink-300">{r.city}</td>
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
          <ChartPlaceholder title="Grade 60 Saria — Karachi" data={steelRates[0].sparkline} unit="PKR per ton" positive={false} />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — Grade 60, Karachi
            </h2>
            <ComparisonTable
              rows={[
                { label: "vs Yesterday", amount: steelComparison.vsYesterday.amount, percent: steelComparison.vsYesterday.percent, trend: "down" },
                { label: "vs Last Week", amount: steelComparison.vsLastWeek.amount, percent: steelComparison.vsLastWeek.percent, trend: "down" },
                { label: "vs Last Month", amount: steelComparison.vsLastMonth.amount, percent: steelComparison.vsLastMonth.percent, trend: "down" },
              ]}
            />
          </div>
        </section>

        <FAQSection title="Steel / Saria Rate FAQs" items={steelFAQs} />
        <RelatedCategories excludeSlug="steel" />
      </div>
    </>
  );
}
