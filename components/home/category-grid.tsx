import type { ComponentType } from "react";
import Link from "next/link";
import {
  Coins,
  Banknote,
  Fuel,
  Bitcoin,
  Ticket,
  Package,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { categories } from "@/lib/mock-data";

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  coins: Coins,
  banknote: Banknote,
  fuel: Fuel,
  bitcoin: Bitcoin,
  ticket: Ticket,
  package: Package,
  layers: Layers,
};

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <SectionHeading
        eyebrow="Explore Everything"
        title="Seven categories. One source of truth."
        description="Every commodity your household or business needs to price something today."
      />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Coins;
          return (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-pulse-300 dark:hover:border-pulse-700"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-pulse-600 dark:text-pulse-400 transition-colors group-hover:bg-pulse-600 group-hover:text-white">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink-300 dark:text-ink-600 transition-all group-hover:text-pulse-600 dark:group-hover:text-pulse-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold text-ink-950 dark:text-white">
                {cat.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
                {cat.description}
              </p>

              <div className="mt-5 flex items-end justify-between border-t border-ink-200 dark:border-ink-800 pt-4">
                <div>
                  <p className="font-rate text-xl font-semibold text-ink-900 dark:text-ink-100">
                    {cat.headlineValue}
                  </p>
                  <p className="text-xs text-ink-400">{cat.headlineLabel}</p>
                </div>
                {cat.trend !== "flat" && (
                  <DeltaBadge
                    percent={cat.trend === "up" ? 1.2 : -1.2}
                    trend={cat.trend}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
