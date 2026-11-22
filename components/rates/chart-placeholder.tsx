import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/shared/sparkline";
import { formatPKR } from "@/lib/utils";

/**
 * Trend chart fed by REAL published history: every caller passes
 * the `sparkline` array built in lib/data/rates.ts from the
 * domain's fact table (most recent published values, oldest
 * first). Previously this card labelled that real data
 * "Illustrative — live charting arrives with the data API" and
 * printed fixed Mon..Today axis labels the data never promised;
 * it now states exactly what is plotted. With fewer than two
 * published points there is no trend to draw, so it says so
 * instead of rendering a degenerate line.
 */
export function ChartPlaceholder({
  title,
  data,
  unit,
  positive = true,
}: {
  title: string;
  data: number[];
  unit: string;
  positive?: boolean;
}) {
  const points = data.filter((v) => Number.isFinite(v) && v > 0);
  const hasTrend = points.length >= 2;
  const latest = hasTrend ? points[points.length - 1] : null;
  const high = hasTrend ? Math.max(...points) : null;
  const low = hasTrend ? Math.min(...points) : null;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
          {title} — Recent Trend
        </h3>
        <span className="text-[11px] text-ink-400">
          {hasTrend ? `Last ${points.length} published rates` : "Published history"}
        </span>
      </div>
      {hasTrend ? (
        <>
          <div className="mt-6 h-40">
            <Sparkline data={points} positive={positive} className="h-full" />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink-400 font-rate">
            <span>Earlier</span>
            <span>Latest</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-500 dark:text-ink-400">
            <span>Latest: <strong className="font-rate text-ink-900 dark:text-ink-100">Rs {formatPKR(latest!, { decimals: latest! < 1000 ? 2 : 0 })}</strong></span>
            <span>High: <strong className="font-rate text-ink-900 dark:text-ink-100">Rs {formatPKR(high!, { decimals: high! < 1000 ? 2 : 0 })}</strong></span>
            <span>Low: <strong className="font-rate text-ink-900 dark:text-ink-100">Rs {formatPKR(low!, { decimals: low! < 1000 ? 2 : 0 })}</strong></span>
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-ink-400">
          Not enough published history yet to draw a trend — this chart fills in as more rates are published.
        </p>
      )}
      <p className="mt-3 text-xs text-ink-400">Values in {unit}</p>
    </Card>
  );
}
