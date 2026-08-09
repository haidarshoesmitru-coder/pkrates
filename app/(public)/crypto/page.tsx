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
import { getCryptoRates, computeLastUpdatedLabel } from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getCryptoCoins } from "@/lib/data/reference";
import { cryptoFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Crypto Prices in PKR — Bitcoin, Ethereum & More | PKRates",
  description:
    "Live cryptocurrency prices converted to Pakistani Rupees — Bitcoin, Ethereum, Tether, BNB, Solana, XRP and more, updated every few minutes.",
};

export default async function CryptoPricesPage() {
  try {
  const cryptoRates = await getCryptoRates();

  if (cryptoRates.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Crypto prices are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }

  const coins = await getCryptoCoins();
  const btcId = coins.find((c) => c.symbol === "BTC")?.id;
  // crypto_rates has no `status` column (api_auto only, no review
  // gate — see the Data Architecture) so the match filter omits it,
  // unlike every other domain's comparison call.
  const comparison = await getComparison("crypto_rates", "price_pkr", { coin_id: btcId ?? -1 }, cryptoRates[0].pricePkr);
  const lastUpdated = computeLastUpdatedLabel(cryptoRates.map(() => new Date().toISOString()));

  return (
    <>
      <CategoryPageHeader
        title="Crypto Prices in PKR"
        description="Top cryptocurrencies priced live in PKR and USD, converted using the current interbank exchange rate."
        breadcrumbLabel="Crypto Prices"
        lastUpdated={lastUpdated}
        source="CoinGecko API"
        shareText={`Bitcoin (BTC): Rs ${formatPKR(cryptoRates[0].pricePkr)} on PKRates`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Top Coins
          </h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-medium">Coin</th>
                  <th className="px-5 py-3 font-medium text-right">Price (USD)</th>
                  <th className="px-5 py-3 font-medium text-right">Price (PKR)</th>
                  <th className="px-5 py-3 font-medium text-right">24h Change</th>
                  <th className="px-5 py-3 font-medium text-right">Watch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {cryptoRates.map((c) => (
                  <tr key={c.symbol} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink-900 dark:text-ink-100">{c.symbol}</p>
                      <p className="text-xs text-ink-400">{c.name}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-rate text-ink-700 dark:text-ink-200">${formatPKR(c.priceUsd, { decimals: c.priceUsd < 10 ? 2 : 0 })}</td>
                    <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">Rs {formatPKR(c.pricePkr, { decimals: c.pricePkr < 1000 ? 2 : 0 })}</td>
                    <td className="px-5 py-4 text-right"><DeltaBadge percent={c.changePercent} trend={c.trend} className="ml-auto" /></td>
                    <td className="px-5 py-4 text-right"><WatchlistButton id={`crypto-${c.symbol.toLowerCase()}`} className="ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="Bitcoin (BTC) in PKR" data={cryptoRates[0].sparkline} unit="PKR" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — Bitcoin
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

        <FAQSection title="Crypto Price FAQs" items={cryptoFAQs} />
        <RelatedCategories excludeSlug="crypto" />
      </div>
    </>
  );
  } catch (err) {
    console.error("[crypto page error]", err);
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Crypto prices are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }
}
