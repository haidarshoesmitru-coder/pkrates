import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/shared/sparkline";

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
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
          {title} — 7-Day Trend
        </h3>
        <span className="flex items-center gap-1 text-[11px] text-ink-400">
          <Info className="h-3 w-3" />
          Illustrative — live charting arrives with the data API
        </span>
      </div>
      <div className="mt-6 h-40">
        <Sparkline data={data} positive={positive} className="h-full" />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-ink-400 font-rate">
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink-400">Values in {unit}</p>
    </Card>
  );
}
