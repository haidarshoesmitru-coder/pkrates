import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCities, getPrizeBondDenominations } from "@/lib/data/reference";
import type { PrizeBondDraw } from "@/types";

function formatDenomination(faceValue: number): string {
  return `Rs. ${faceValue.toLocaleString("en-PK")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

interface DrawRow {
  id: string;
  denomination_id: number;
  draw_number: number;
  city_id: number;
  draw_date: string;
  status: "scheduled" | "completed" | "postponed" | "cancelled";
}

interface FirstPrizeRow {
  draw_id: string;
  prize_amount: number | null;
}

/** Upcoming + recently completed draws, shaped exactly like the
 * original PrizeBondDraw[] the UI already expects. Completed draws
 * carry their first-prize amount for the "1st Prize: Rs X" line
 * the draw cards already render.
 *
 * Every intermediate Supabase result here (`draws`, `firstPrizes`)
 * is explicitly cast to its real shape, not just the function's
 * final return type — an outer `Promise<T>` annotation alone
 * doesn't stop an untyped intermediate variable from independently
 * collapsing to `never` and breaking every `.filter()`/`.map()`
 * access inside the function body (the same failure class already
 * fixed in lib/data/reference.ts and lib/data/admin.ts, just one
 * level deeper here). */
export async function getPrizeBondDraws(): Promise<PrizeBondDraw[]> {
  const supabase = await createSupabaseServerClient();
  const [denominations, cities, { data: drawsData, error: drawsErr }] = await Promise.all([
    getPrizeBondDenominations(),
    getCities(),
    supabase
      .from("prize_bond_draws")
      .select("id, denomination_id, draw_number, city_id, draw_date, status")
      .order("draw_date", { ascending: true })
      .limit(8),
  ]);
  if (drawsErr) throw drawsErr;
  const draws = (drawsData ?? []) as DrawRow[];

  const drawIds = draws.filter((d) => d.status === "completed").map((d) => d.id);
  const { data: firstPrizesData } = drawIds.length
    ? await supabase
        .from("prize_bond_winners")
        .select("draw_id, prize_amount")
        .eq("prize_tier", 1)
        .in("draw_id", drawIds)
    : { data: [] as FirstPrizeRow[] };
  const firstPrizes = (firstPrizesData ?? []) as FirstPrizeRow[];

  return draws.map((draw) => {
    const denomination = denominations.find((d) => d.id === draw.denomination_id);
    const city = cities.find((c) => c.id === draw.city_id);
    const firstPrize = firstPrizes.find((p) => p.draw_id === draw.id)?.prize_amount;
    return {
      denomination: denomination ? formatDenomination(denomination.face_value) : "Unknown",
      drawNumber: draw.draw_number,
      city: city?.name ?? "Unknown",
      date: formatDate(draw.draw_date),
      status: draw.status === "completed" ? "completed" : "upcoming",
      firstPrize: firstPrize ? `Rs. ${firstPrize.toLocaleString("en-PK")}` : undefined,
    };
  });
}

export interface RecentPrizeBondResult {
  denomination: string;
  drawNumber: number;
  city: string;
  date: string;
  firstPrize: string;
}

/** The most recently completed draws with their 1st-prize winner —
 * powers the "Recent Draw History" list on the Prize Bonds page. */
export async function getRecentPrizeBondResults(): Promise<RecentPrizeBondResult[]> {
  const supabase = await createSupabaseServerClient();
  const [denominations, cities, { data: completedDrawsData, error }] = await Promise.all([
    getPrizeBondDenominations(),
    getCities(),
    supabase
      .from("prize_bond_draws")
      .select("id, denomination_id, draw_number, city_id, draw_date")
      .eq("status", "completed")
      .order("draw_date", { ascending: false })
      .limit(5),
  ]);
  if (error) throw error;
  const completedDraws = (completedDrawsData ?? []) as Omit<DrawRow, "status">[];

  const drawIds = completedDraws.map((d) => d.id);
  const { data: firstPrizesData } = drawIds.length
    ? await supabase.from("prize_bond_winners").select("draw_id, prize_amount").eq("prize_tier", 1).in("draw_id", drawIds)
    : { data: [] as FirstPrizeRow[] };
  const firstPrizes = (firstPrizesData ?? []) as FirstPrizeRow[];

  return completedDraws.map((draw) => {
    const denomination = denominations.find((d) => d.id === draw.denomination_id);
    const city = cities.find((c) => c.id === draw.city_id);
    const firstPrize = firstPrizes.find((p) => p.draw_id === draw.id)?.prize_amount;
    return {
      denomination: denomination ? formatDenomination(denomination.face_value) : "Unknown",
      drawNumber: draw.draw_number,
      city: city?.name ?? "Unknown",
      date: formatDate(draw.draw_date),
      firstPrize: firstPrize ? `Rs. ${firstPrize.toLocaleString("en-PK")}` : "—",
    };
  });
}
