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
import { getCurrencyRates, computeLastUpdatedLabel } from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getCurrencies } from "@/lib/data/reference";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currencyFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Currency Rates Today — USD, AED, GBP to PKR | PKRates",
  description:
    "Live interbank and open market currency rates for USD, AED, GBP, EUR, SAR and more — buy/sell rates against PKR, sourced from the State Bank of Pakistan and licensed exchange companies.",
};

export default async function CurrencyRatesPage() {
  const currencyRates = await getCurrencyRates("open_market");

  if (currencyRates.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Currency rates are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }

  const currencies = await getCurrencies();
  const usdId = currencies.find((c) => c.code === "USD")?.id;

  const supabase = await createSupabaseServerClient();
  const { data: usdHistoryData } = usdId
    ? await supabase
        .from("currency_rates")
        .select("sell_rate")
        .eq("currency_id", usdId)
        .eq("rate_type", "interbank")
        .eq("status", "published")
        .order("effective_at", { ascending: false })
        .limit(7)
    : { data: [] as { sell_rate: number }[] };
  const usdHistory = (usdHistoryData ?? []) as { sell_rate: number }[];
  const usdSparkline = [...usdHistory].reverse().map((r) => r.sell_rate);

  const comparison = await getComparison(
    "currency_rates", "sell_rate",
    { currency_id: usdId ?? -1, rate_type: "open_market", status: "published" },
    currencyRates[0].openSell
  );
  const lastUpdated = computeLastUpdatedLabel(currencyRates.map(() => new Date().toISOString()));

  return (
    <>
      <CategoryPageHeader
        title="Currency Rates Today"
        description="Interbank and open market buy/sell rates for 15+ currencies against the Pakistani Rupee."
        breadcrumbLabel="Currency Rates"
        lastUpdated={lastUpdated}
        source="State Bank of Pakistan"
        shareText={`USD/PKR Interbank sell rate: Rs ${formatPKR(currencyRates[0].interbankSell, { decimals: 2 })} on PKRates`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Open Market Rates
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">Currency</th>
                  <th className="px-5 py-3 font-medium text-right">Buy</th>
                  <th className="px-5 py-3 font-medium text-right">Sell</th>
                  <th className="px-5 py-3 font-medium text-right">Change</th>
                  <th className="px-5 py-3 font-medium text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {currencyRates.map((c) => (
                  <tr key={c.code} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{c.flag}</span>
                        <div>
                          <p className="font-medium text-ink-900 dark:text-ink-100">{c.code}</p>
                          <p className="text-xs text-ink-400">{c.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-rate text-ink-700 dark:text-ink-200">{formatPKR(c.openBuy, { decimals: 2 })}</td>
                    <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">{formatPKR(c.openSell, { decimals: 2 })}</td>
                    <td className="px-5 py-4 text-right"><DeltaBadge percent={c.changePercent} trend={c.trend} className="ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><WatchlistButton id={`currency-${c.code.toLowerCase()}`} className="ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
          <p className="mt-3 text-xs text-ink-400">Interbank rates typically run a small premium below open market — see the FAQ below for the difference.</p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="USD / PKR — Interbank" data={usdSparkline} unit="PKR per USD" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — USD/PKR
            </h2>
            <ComparisonTable
              rows={[
                { label: "vs Yesterday", amount: `${comparison.vsYesterday.amount >= 0 ? "+" : ""}Rs ${comparison.vsYesterday.amount.toFixed(2)}`, percent: comparison.vsYesterday.percent, trend: comparison.vsYesterday.trend },
                { label: "vs Last Week", amount: `${comparison.vsLastWeek.amount >= 0 ? "+" : ""}Rs ${comparison.vsLastWeek.amount.toFixed(2)}`, percent: comparison.vsLastWeek.percent, trend: comparison.vsLastWeek.trend },
                { label: "vs Last Month", amount: `${comparison.vsLastMonth.amount >= 0 ? "+" : ""}Rs ${comparison.vsLastMonth.amount.toFixed(2)}`, percent: comparison.vsLastMonth.percent, trend: comparison.vsLastMonth.trend },
              ]}
            />
          </div>
        </section>

        <FAQSection title="Currency Rate FAQs" items={currencyFAQs} />
        <RelatedCategories excludeSlug="currency" />
      </div>
    </>
  );
}
