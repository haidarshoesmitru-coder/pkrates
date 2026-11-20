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
import { getGoldRates, computeLastUpdatedLabel } from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getGoldKarats, getCities } from "@/lib/data/reference";
import { goldFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Gold Rate Today in Pakistan — 24K, 22K, 21K, 18K | PKRates",
  description:
    "Live gold rates today across Karachi, Lahore, Islamabad, Peshawar and Quetta — 24K, 22K, 21K and 18K, per tola and per gram, verified against Sarafa Association boards.",
};

export default async function GoldRatesPage() {
  try {
  const goldRates = await getGoldRates();

  if (goldRates.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Gold rates are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }

  const [karats, cities] = await Promise.all([getGoldKarats(), getCities()]);
  const karat24Id = karats.find((k) => k.label === "24K")?.id;
  const karachiId = cities.find((c) => c.name === "Karachi")?.id;
  const comparison = await getComparison(
    "gold_rates", "rate_per_tola",
    { karat_id: karat24Id ?? -1, city_id: karachiId ?? -1, status: "published" },
    goldRates[0].karat24
  );
  const lastUpdated = computeLastUpdatedLabel(goldRates.map((r) => r.effectiveAt ?? ""));

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
          {([["22K", "karat22"], ["21K", "karat21"], ["18K", "karat18"]] as const).map(([label, key]) => (
            <section key={label} className="mt-10">
              <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
                {label} Gold Rate by City
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                      {goldRates.map((r) => (
                        <tr key={`${label}-${r.city}`} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                          <td className="px-5 py-4 font-medium text-ink-900 dark:text-ink-100">{r.city}</td>
                          <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">Rs {formatPKR(r[key])}</td>
                          <td className="px-5 py-4 text-right font-rate text-ink-600 dark:text-ink-300">Rs {formatPKR(r[key] / 11.6638038 * 10)}</td>
                          <td className="px-5 py-4 text-right font-rate text-ink-600 dark:text-ink-300">Rs {formatPKR(r[key] / 11.6638038)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="Gold 24K — Karachi" data={goldRates[0].sparkline} unit="PKR per tola" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison
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

        <FAQSection title="Gold Rate FAQs" items={goldFAQs} />
        <RelatedCategories excludeSlug="gold" />
      </div>
    </>
  );
  } catch (err) {
    console.error("[gold page error]", err);
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Gold rates are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }
}
