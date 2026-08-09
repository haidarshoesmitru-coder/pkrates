import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TrendDirection } from "@/types";
import type { Database } from "@/types/database";

type TableName = keyof Database["public"]["Tables"];

export interface ComparisonPeriod {
  amount: number;
  percent: number;
  trend: TrendDirection;
}

export interface ComparisonResult {
  vsYesterday: ComparisonPeriod;
  vsLastWeek: ComparisonPeriod;
  vsLastMonth: ComparisonPeriod;
}

const EMPTY_PERIOD: ComparisonPeriod = { amount: 0, percent: 0, trend: "flat" };
const EMPTY_RESULT: ComparisonResult = { vsYesterday: EMPTY_PERIOD, vsLastWeek: EMPTY_PERIOD, vsLastMonth: EMPTY_PERIOD };

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function toPeriod(current: number, past: number | undefined): ComparisonPeriod {
  if (past === undefined) return EMPTY_PERIOD;
  const amount = Math.round((current - past) * 100) / 100;
  const percent = past ? Math.round(((current - past) / past) * 10000) / 100 : 0;
  return { amount, percent, trend: amount > 0 ? "up" : amount < 0 ? "down" : "flat" };
}

/**
 * Generic vs-yesterday/vs-last-week/vs-last-month comparison,
 * reused by every domain rather than reimplemented per page. Finds
 * the closest published row at or before each cutoff and diffs it
 * against the current value — a real computation over the ledger,
 * not a fabricated number.
 *
 * `table` is typed against the real `TableName` union (see
 * types/database.ts) so `.from(table)` always resolves cleanly.
 * `valueColumn` stays a plain string — there's no single type that
 * spans "whichever numeric column this particular table uses"
 * (rate_per_tola, sell_rate, price_per_bag, ...). `valueColumn`
 * stays a plain string for that reason — `.select(valueColumn)`
 * compiles cleanly against it without needing a suppressed error,
 * since Supabase's column-selection typing doesn't require the
 * column name to be a literal member of the row shape.
 */
export async function getComparison(
  table: TableName,
  valueColumn: string,
  matchFilters: Record<string, string | number>,
  currentValue: number,
  effectiveColumn: "effective_at" | "effective_from" = "effective_at"
): Promise<ComparisonResult> {
  if (!currentValue) return EMPTY_RESULT;

  const supabase = await createSupabaseServerClient();

  async function valueBefore(cutoffIso: string): Promise<number | undefined> {
    let query = supabase
      .from(table)
      .select(valueColumn)
      .lte(effectiveColumn, cutoffIso)
      .order(effectiveColumn, { ascending: false })
      .limit(1);
    for (const [key, val] of Object.entries(matchFilters)) {
      query = query.eq(key, val);
    }
    const { data } = await query.maybeSingle();
    return (data as Record<string, number> | null)?.[valueColumn];
  }

  const [yesterday, lastWeek, lastMonth] = await Promise.all([
    valueBefore(daysAgoIso(1)),
    valueBefore(daysAgoIso(7)),
    valueBefore(daysAgoIso(30)),
  ]);

  return {
    vsYesterday: toPeriod(currentValue, yesterday),
    vsLastWeek: toPeriod(currentValue, lastWeek),
    vsLastMonth: toPeriod(currentValue, lastMonth),
  };
}
