import { Card } from "@/components/ui/card";
import { DeltaBadge } from "@/components/shared/delta-badge";
import type { TrendDirection } from "@/types";

export interface ComparisonRow {
  label: string;
  amount: string;
  percent: number;
  trend: TrendDirection;
}

export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
            <th className="px-5 py-3 font-medium">Period</th>
            <th className="px-5 py-3 font-medium text-right">Change</th>
            <th className="px-5 py-3 font-medium text-right">Percent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
          {rows.map((row) => (
            <tr key={row.label} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
              <td className="px-5 py-3.5 font-medium text-ink-700 dark:text-ink-300">{row.label}</td>
              <td className="px-5 py-3.5 text-right font-rate text-ink-900 dark:text-ink-100">{row.amount}</td>
              <td className="px-5 py-3.5 text-right">
                <DeltaBadge percent={row.percent} trend={row.trend} className="ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
