import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { CATEGORY_META } from "@/lib/categories-static";

export function RelatedCategories({ excludeSlug }: { excludeSlug: string }) {
  const related = CATEGORY_META.filter((c) => c.slug !== excludeSlug);

  return (
    <section>
      <SectionHeading eyebrow="Explore More" title="Related Categories" />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {related.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-pulse-300 dark:hover:border-pulse-700"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-ink-900 dark:text-ink-100">{cat.title}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-ink-300 dark:text-ink-600 transition-all group-hover:text-pulse-600 dark:group-hover:text-pulse-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
            </div>
            <p className="mt-2 font-rate text-xs text-ink-400">{cat.headlineLabel}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
