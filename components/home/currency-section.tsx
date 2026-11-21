import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatPKR } from "@/lib/utils";
import type { CurrencyRate } from "@/types";

function CurrencyTable({ mode, rates }: { mode: "interbank" | "open"; rates: CurrencyRate[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 dark:border-ink-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
            <th className="px-5 py-3 font-medium">Currency</th>
            <th className="px-5 py-3 font-medium text-right">Buy</th>
            <th className="px-5 py-3 font-medium text-right">Sell</th>
            <th className="px-5 py-3 font-medium text-right">Change</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
          {rates.map((c) => (
            <tr key={c.code} className="bg-[var(--surface)] hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">{c.flag}</span>
                  <div>
                    <p className="font-medium text-ink-900 dark:text-ink-100">{c.code}</p>
                    <p className="text-xs text-ink-400">{c.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-right font-rate text-ink-700 dark:text-ink-200">
                {formatPKR(mode === "interbank" ? c.interbankBuy : c.openBuy, { decimals: 2 })}
              </td>
              <td className="px-5 py-4 text-right font-rate font-semibold text-ink-950 dark:text-white">
                {formatPKR(mode === "interbank" ? c.interbankSell : c.openSell, { decimals: 2 })}
              </td>
              <td className="px-5 py-4 text-right">
                <DeltaBadge percent={c.changePercent} trend={c.trend} className="ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CurrencySection({ rates }: { rates: CurrencyRate[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <SectionHeading
          eyebrow="Currency Rates"
          title="Interbank and open market, side by side"
          description="Know exactly which rate applies to your transfer, purchase or remittance."
        />
      </div>

      {rates.length === 0 ? (
        <p className="mt-8 text-sm text-ink-400">Currency rates are temporarily unavailable.</p>
      ) : (
        <Tabs defaultValue="interbank" className="mt-8">
          <TabsList>
            <TabsTrigger value="interbank">Interbank</TabsTrigger>
            <TabsTrigger value="open">Open Market</TabsTrigger>
          </TabsList>
          <TabsContent value="interbank">
            <CurrencyTable mode="interbank" rates={rates} />
          </TabsContent>
          <TabsContent value="open">
            <CurrencyTable mode="open" rates={rates} />
          </TabsContent>
        </Tabs>
      )}

      <div className="mt-6 flex justify-end">
        <Button asChild variant="link">
          <Link href="/currency">
            View all 15+ currencies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
