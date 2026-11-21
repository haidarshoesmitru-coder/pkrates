import { Breadcrumb } from "@/components/rates/breadcrumb";
import { LastUpdated } from "@/components/rates/last-updated";
import { SourceBadge } from "@/components/rates/source-badge";
import { ShareBar } from "@/components/rates/share-bar";

export function CategoryPageHeader({
  title,
  description,
  breadcrumbLabel,
  lastUpdated,
  source,
  shareText,
}: {
  title: string;
  description: string;
  breadcrumbLabel: string;
  lastUpdated: string;
  source: string;
  shareText: string;
}) {
  return (
    <div className="border-b border-ink-200 dark:border-ink-800 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumb items={[{ label: breadcrumbLabel }]} />
        <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-500 dark:text-ink-400">{description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <LastUpdated timestamp={lastUpdated} />
              <SourceBadge source={source} />
            </div>
          </div>
          <ShareBar title={title} text={shareText} />
        </div>
      </div>
    </div>
  );
}
