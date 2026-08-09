import type { Metadata } from "next";
import { Search, Ticket } from "lucide-react";
import { CategoryPageHeader } from "@/components/rates/page-header";
import { ChartPlaceholder } from "@/components/rates/chart-placeholder";
import { FAQSection } from "@/components/rates/faq-section";
import { RelatedCategories } from "@/components/rates/related-categories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPrizeBondDraws, getRecentPrizeBondResults } from "@/lib/data/prize-bonds";
import { prizeBondFAQs } from "@/lib/faq-content";

export const metadata: Metadata = {
  title: "Prize Bond Results & Draw Calendar Pakistan | PKRates",
  description:
    "Search prize bond draw results by bond number, and check the full upcoming draw calendar for every denomination — sourced from National Savings.",
};

export default async function PrizeBondsPage() {
  try {
  const [draws, recentResults] = await Promise.all([getPrizeBondDraws(), getRecentPrizeBondResults()]);
  const lastUpdated = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <CategoryPageHeader
        title="Prize Bond Results & Draw Calendar"
        description="Search winning bond numbers and check upcoming draw dates for every denomination."
        breadcrumbLabel="Prize Bonds"
        lastUpdated={lastUpdated}
        source="National Savings"
        shareText="Check the latest prize bond draw results and calendar on PKRates"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        <section>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search your bond number, e.g. 0512345"
              className="h-12 w-full rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] pl-11 pr-4 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
            />
          </div>
          <p className="mt-2 text-xs text-ink-400">Search checks published results across all denominations and draw dates.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
            Upcoming &amp; Recent Draws
          </h2>
          {draws.length === 0 ? (
            <p className="text-sm text-ink-400">No draw information is available right now.</p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {draws.map((draw) => (
              <Card key={`${draw.denomination}-${draw.drawNumber}`} className="p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-gold-600 dark:text-gold-400">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <Badge variant={draw.status === "upcoming" ? "default" : "muted"}>
                    {draw.status === "upcoming" ? "Upcoming" : "Completed"}
                  </Badge>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-950 dark:text-white">{draw.denomination}</h3>
                <p className="text-xs text-ink-400">Draw #{draw.drawNumber} &middot; {draw.city}</p>
                <div className="mt-4 border-t border-ink-200 dark:border-ink-800 pt-3">
                  <p className="text-xs text-ink-500 dark:text-ink-400">{draw.status === "upcoming" ? "Draw date" : "Drawn on"}</p>
                  <p className="font-rate text-sm font-semibold text-ink-900 dark:text-ink-100">{draw.date}</p>
                  {draw.firstPrize && (
                    <p className="mt-1 text-xs text-pulse-600 dark:text-pulse-400 font-medium">1st Prize: {draw.firstPrize}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder title="Draw Frequency (illustrative)" data={[1, 1, 2, 1, 2, 1, 3]} unit="draws / week across denominations" />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">
              Recent Draw History
            </h2>
            {recentResults.length === 0 ? (
              <p className="text-sm text-ink-400">No completed draws recorded yet.</p>
            ) : (
            <Card className="divide-y divide-ink-200 dark:divide-ink-800">
              {recentResults.map((d) => (
                <div key={`${d.denomination}-${d.drawNumber}`} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{d.denomination} &middot; Draw #{d.drawNumber}</p>
                    <p className="text-xs text-ink-400">{d.city} &middot; {d.date}</p>
                  </div>
                  <p className="font-rate text-xs font-medium text-pulse-600 dark:text-pulse-400">{d.firstPrize}</p>
                </div>
              ))}
            </Card>
            )}
          </div>
        </section>

        <FAQSection title="Prize Bond FAQs" items={prizeBondFAQs} />
        <RelatedCategories excludeSlug="prize-bonds" />
      </div>
    </>
  );
  } catch (err) {
    console.error("[prize-bonds page error]", err);
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-white">
          Prize bond information is temporarily unavailable
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          We&rsquo;re having trouble reaching live data. Please check back shortly.
        </p>
      </div>
    );
  }
}
