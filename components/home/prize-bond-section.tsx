import Link from "next/link";
import { Ticket, ArrowRight, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";
import { prizeBondDraws } from "@/lib/mock-data";

export function PrizeBondSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <SectionHeading
          eyebrow="Prize Bonds"
          title="Draw calendar and results, searchable by bond number"
          description="Never miss a draw — check upcoming schedules or search your bond number against the latest results."
        />
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search bond number"
            className="h-11 w-full rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] pl-11 pr-4 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {prizeBondDraws.map((draw) => (
          <Card key={`${draw.denomination}-${draw.drawNumber}`} className="p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-gold-600 dark:text-gold-400">
                <Ticket className="h-4 w-4" />
              </span>
              <Badge variant={draw.status === "upcoming" ? "default" : "muted"}>
                {draw.status === "upcoming" ? "Upcoming" : "Completed"}
              </Badge>
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink-950 dark:text-white">
              {draw.denomination}
            </h3>
            <p className="text-xs text-ink-400">Draw #{draw.drawNumber} &middot; {draw.city}</p>
            <div className="mt-4 border-t border-ink-200 dark:border-ink-800 pt-3">
              <p className="text-xs text-ink-500 dark:text-ink-400">
                {draw.status === "upcoming" ? "Draw date" : "Drawn on"}
              </p>
              <p className="font-rate text-sm font-semibold text-ink-900 dark:text-ink-100">
                {draw.date}
              </p>
              {draw.firstPrize && (
                <p className="mt-1 text-xs text-pulse-600 dark:text-pulse-400 font-medium">
                  1st Prize: {draw.firstPrize}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button asChild variant="link">
          <Link href="/prize-bonds">
            View full draw calendar &amp; results
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
