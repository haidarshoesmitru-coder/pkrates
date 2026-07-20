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
import { cementRates, cementComparison, cementFAQs, lastUpdated } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Cement Price Today in Pakistan — Per Bag Rates | PKRates",
  description:
    "Live cement prices per 50kg bag across major brands — Lucky, DG, Bestway, Fauji, Maple Leaf — and cities in Pakistan, sourced from dealer networks.",
};

export default function CementRatesPage() {
  return (
    <>
      <CategoryPageHeader
        title="Cement Price Today"
        description="Per-bag cement pricing across major brands and cities, verified through dealer networks."
        breadcrumbLabel="Cement Rates"
        lastUpdated={lastUpdated}
        source="City Dealer Networks"
        shareText={`Lucky Cement in Lahore: Rs ${formatPKR(cementRates[0].pricePerBag)} per bag on PKRates`}
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
          <ChartPlaceholder title="Lucky Cement — Lahore" data={cementRates[0].sparkline} unit="PKR per bag" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — Lucky Cement, Lahore
            </h2>
            <ComparisonTable
              rows={[
                { label: "vs Yesterday", amount: cementComparison.vsYesterday.amount, percent: cementComparison.vsYesterday.percent, trend: "up" },
                { label: "vs Last Week", amount: cementComparison.vsLastWeek.amount, percent: cementComparison.vsLastWeek.percent, trend: "up" },
                { label: "vs Last Month", amount: cementComparison.vsLastMonth.amount, percent: cementComparison.vsLastMonth.percent, trend: "up" },
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
