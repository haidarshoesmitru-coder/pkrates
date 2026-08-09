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
import { getFuelPrices, computeLastUpdatedLabel } from "@/lib/data/rates";
import { getComparison } from "@/lib/data/history";
import { getFuelTypes } from "@/lib/data/reference";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { petrolFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Petrol Price Today in Pakistan | PKRates",
  description:
    "Official, OGRA-notified petrol, diesel and kerosene prices in Pakistan — current rate, effective date, and full change history.",
};

export default async function PetrolPricesPage() {
  const fuelPrices = await getFuelPrices();

  if (fuelPrices.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Petrol prices are temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }

  const fuelTypes = await getFuelTypes();
  const petrolTypeId = fuelTypes.find((f) => f.name === "Petrol")?.id;

  const supabase = await createSupabaseServerClient();
  const { data: petrolHistoryData } = petrolTypeId
    ? await supabase
        .from("fuel_prices")
        .select("price_per_liter")
        .eq("fuel_type_id", petrolTypeId)
        .eq("status", "published")
        .order("effective_from", { ascending: false })
        .limit(7)
    : { data: [] as { price_per_liter: number }[] };
  const petrolHistory = (petrolHistoryData ?? []) as { price_per_liter: number }[];
  const petrolSparkline = [...petrolHistory].reverse().map((r) => r.price_per_liter);

  // Petrol is event-sourced (OGRA notifications, not a continuous
  // ledger) — comparison is computed against effective_from windows
  // rather than effective_at, and will often legitimately read 0%
  // for "vs yesterday" since prices only change on notification
  // dates, not daily. That's accurate, not a bug.
  const comparison = await getComparison(
    "fuel_prices", "price_per_liter",
    { fuel_type_id: petrolTypeId ?? -1, status: "published" },
    fuelPrices[0].pricePerLiter,
    "effective_from"
  );
  const lastUpdated = computeLastUpdatedLabel(fuelPrices.map(() => new Date().toISOString()));

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
                  Next review: {fuel.nextReviewEstimate}
                </div>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="Petrol Price" data={petrolSparkline} unit="PKR per litre" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Historical Comparison — Petrol
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

        <FAQSection title="Petrol Price FAQs" items={petrolFAQs} />
        <RelatedCategories excludeSlug="petrol" />
      </div>
    </>
  );
}
