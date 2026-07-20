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
import { goldRates, goldComparison, goldFAQs, lastUpdated } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Gold Rate Today in Pakistan — 24K, 22K, 21K, 18K | PKRates",
  description:
    "Live gold rates today across Karachi, Lahore, Islamabad, Peshawar and Quetta — 24K, 22K, 21K and 18K, per tola and per gram, verified against Sarafa Association boards.",
};

export default function GoldRatesPage() {
  return (
    <>
      <CategoryPageHeader
        title="Gold Rate Today in Pakistan"
        description="City-wise, karat-wise gold rates verified against Sarafa Association boards, updated multiple times a day."
        breadcrumbLabel="Gold Rates"
        lastUpdated={lastUpdated}
        source="Karachi Sarafa Association"
        shareText={`Gold 24K in Karachi: Rs ${formatPKR(goldRates[0].karat24)} per tola on PKRates`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            24K Gold Rate by City
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">City</th>
                  <th className="px-5 py-3 font-medium text-right">Per Tola</th>
                  <th className="px-5 py-3 font-medium text-right">Per 10g</th>
                  <th className="px-5 py-3 font-medium text-right">Per Gram</th>
                  <th className="px-5 py-3 font-medium text-right">Change</th>
                  <th className="px-5 py-3 font-medium text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {goldRates.map((r) => (
                  <tr key={r.city} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    <td className="px-5 py-4 font-medium text-ink-900 dark:text-ink-100">{r.city}</td>
                    <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">Rs {formatPKR(r.karat24)}</td>
                    <td className="px-5 py-4 text-right font-rate text-ink-600 dark:text-ink-300">Rs {formatPKR(r.karat24 / 11.6638038 * 10)}</td>
                    <td className="px-5 py-4 text-right font-rate text-ink-600 dark:text-ink-300">Rs {formatPKR(r.karat24 / 11.6638038)}</td>
                    <td className="px-5 py-4 text-right"><DeltaBadge percent={r.changePercent} trend={r.trend} className="ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><WatchlistButton id={`gold-${r.city.toLowerCase()}-24K`} className="ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
          <p className="mt-3 text-xs text-ink-400">Also available: 22K, 21K and 18K rates for each city above.</p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="Gold 24K — Karachi" data={goldRates[0].sparkline} unit="PKR per tola" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison
            </h2>
            <ComparisonTable
              rows={[
                { label: "vs Yesterday", amount: `+Rs ${formatPKR(goldComparison.vsYesterday.amount)}`, percent: goldComparison.vsYesterday.percent, trend: "up" },
                { label: "vs Last Week", amount: `+Rs ${formatPKR(goldComparison.vsLastWeek.amount)}`, percent: goldComparison.vsLastWeek.percent, trend: "up" },
                { label: "vs Last Month", amount: `+Rs ${formatPKR(goldComparison.vsLastMonth.amount)}`, percent: goldComparison.vsLastMonth.percent, trend: "up" },
              ]}
            />
          </div>
        </section>

        <FAQSection title="Gold Rate FAQs" items={goldFAQs} />
        <RelatedCategories excludeSlug="gold" />
      </div>
    </>
  );
}
