import type { Metadata } from "next";
import { ShieldCheck, CalendarClock } from "lucide-react";
import { CategoryPageHeader } from "@/components/rates/page-header";
import { ComparisonTable } from "@/components/rates/comparison-table";
import { ChartPlaceholder } from "@/components/rates/chart-placeholder";
import { FAQSection } from "@/components/rates/faq-section";
import { RelatedCategories } from "@/components/rates/related-categories";
import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { formatPKR } from "@/lib/utils";
import { fuelPrices, petrolComparison, petrolFAQs, lastUpdated } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Petrol Price Today in Pakistan | PKRates",
  description:
    "Official, OGRA-notified petrol, diesel and kerosene prices in Pakistan — current rate, effective date, and full change history.",
};

export default function PetrolPricesPage() {
  return (
    <>
      <CategoryPageHeader
        title="Petrol Price Today"
        description="Official government-notified fuel prices, sourced directly from OGRA notifications."
        breadcrumbLabel="Petrol Prices"
        lastUpdated={lastUpdated}
        source="OGRA"
        shareText={`Petrol price today: Rs ${formatPKR(fuelPrices[0].pricePerLiter, { decimals: 2 })}/litre on PKRates`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fuelPrices.map((fuel) => (
            <Card key={fuel.type} className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">{fuel.type}</h3>
                <DeltaBadge percent={fuel.changePercent} trend={fuel.trend} />
              </div>
              <p className="mt-3 font-rate text-3xl font-semibold text-ink-950 dark:text-white">
                Rs {formatPKR(fuel.pricePerLiter, { decimals: 2 })}
                <span className="ml-1 text-sm font-normal text-ink-400">/ litre</span>
              </p>
              <div className="mt-5 space-y-2 border-t border-ink-200 dark:border-ink-800 pt-4">
                <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-pulse-500" />
                  Effective from {fuel.effectiveFrom}
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <CalendarClock className="h-3.5 w-3.5 text-ink-400" />
                  Next review expected {fuel.nextReviewEstimate}
                </div>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="Petrol Price" data={[265.4, 265.4, 265.4, 268.4, 268.4, 268.4, 272.5]} unit="PKR per litre" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — Petrol
            </h2>
            <ComparisonTable
              rows={[
                { label: "vs Yesterday", amount: petrolComparison.vsYesterday.amount, percent: petrolComparison.vsYesterday.percent, trend: "flat" },
                { label: "vs Last Week", amount: petrolComparison.vsLastWeek.amount, percent: petrolComparison.vsLastWeek.percent, trend: "up" },
                { label: "vs Last Month", amount: petrolComparison.vsLastMonth.amount, percent: petrolComparison.vsLastMonth.percent, trend: "up" },
              ]}
            />
          </div>
        </section>

        <FAQSection title="Petrol Price FAQs" items={petrolFAQs} />
        <RelatedCategories excludeSlug="petrol" />
      </div>
    </>
  );
}
