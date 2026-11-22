import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCities, getPrizeBondDenominations } from "@/lib/data/reference";
import type { BondSearchResult, PrizeBondDraw, PrizeBondWinnerTier } from "@/types";

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

interface WinnerRow {
  draw_id: string;
  prize_tier: number;
  bond_number: string;
  prize_amount: number | null;
}

/** Groups flat prize_bond_winners rows into per-draw, per-tier
 * winner lists (bond numbers + the tier's prize amount) for
 * display on the public prize-bonds page. */
function groupWinners(rows: WinnerRow[]): Map<string, PrizeBondWinnerTier[]> {
  const byDraw = new Map<string, Map<number, PrizeBondWinnerTier>>();
  for (const row of rows) {
    let tiers = byDraw.get(row.draw_id);
    if (!tiers) {
      tiers = new Map();
      byDraw.set(row.draw_id, tiers);
    }
    let tier = tiers.get(row.prize_tier);
    if (!tier) {
      tier = {
        tier: row.prize_tier,
        prizeAmount: row.prize_amount ? `Rs. ${row.prize_amount.toLocaleString("en-PK")}` : undefined,
        bondNumbers: [],
      };
      tiers.set(row.prize_tier, tier);
    }
    tier.bondNumbers.push(row.bond_number);
  }
  const result = new Map<string, PrizeBondWinnerTier[]>();
  for (const [drawId, tiers] of byDraw) {
    result.set(drawId, [...tiers.values()].sort((a, b) => a.tier - b.tier));
  }
  return result;
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
  const { data: winnersData } = drawIds.length
    ? await supabase
        .from("prize_bond_winners")
        .select("draw_id, prize_tier, bond_number, prize_amount")
        .in("draw_id", drawIds)
        .order("prize_tier", { ascending: true })
    : { data: [] as WinnerRow[] };
  const winnersByDraw = groupWinners((winnersData ?? []) as WinnerRow[]);

  return draws.map((draw) => {
    const denomination = denominations.find((d) => d.id === draw.denomination_id);
    const city = cities.find((c) => c.id === draw.city_id);
    const winners = winnersByDraw.get(draw.id);
    return {
      denomination: denomination ? formatDenomination(denomination.face_value) : "Unknown",
      drawNumber: draw.draw_number,
      city: city?.name ?? "Unknown",
      date: formatDate(draw.draw_date),
      status: draw.status === "completed" ? "completed" : "upcoming",
      firstPrize: winners?.find((w) => w.tier === 1)?.prizeAmount,
      winners,
    };
  });
}

export interface RecentPrizeBondResult {
  denomination: string;
  drawNumber: number;
  city: string;
  date: string;
  firstPrize: string;
  winners?: PrizeBondWinnerTier[];
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
  const { data: winnersData } = drawIds.length
    ? await supabase
        .from("prize_bond_winners")
        .select("draw_id, prize_tier, bond_number, prize_amount")
        .in("draw_id", drawIds)
        .order("prize_tier", { ascending: true })
    : { data: [] as WinnerRow[] };
  const winnersByDraw = groupWinners((winnersData ?? []) as WinnerRow[]);

  return completedDraws.map((draw) => {
    const denomination = denominations.find((d) => d.id === draw.denomination_id);
    const city = cities.find((c) => c.id === draw.city_id);
    const winners = winnersByDraw.get(draw.id);
    return {
      denomination: denomination ? formatDenomination(denomination.face_value) : "Unknown",
      drawNumber: draw.draw_number,
      city: city?.name ?? "Unknown",
      date: formatDate(draw.draw_date),
      firstPrize: winners?.find((w) => w.tier === 1)?.prizeAmount ?? "—",
      winners,
    };
  });
}

/** Bond-number search across all published winners. Bond numbers
 * are stored exactly as entered in admin (usually 6 digits), so
 * the lookup tries the raw input, the input without leading
 * zeros, and the input zero-padded to 6 digits — a visitor typing
 * "0512345" still matches a stored "512345". */
export async function searchBondNumber(rawNumber: string): Promise<BondSearchResult[]> {
  const digits = rawNumber.replace(/\D/g, "");
  if (!digits) return [];
  const candidates = [...new Set([digits, digits.replace(/^0+/, "") || "0", digits.padStart(6, "0")])];

  const supabase = await createSupabaseServerClient();
  const { data: matchesData, error } = await supabase
    .from("prize_bond_winners")
    .select("draw_id, prize_tier, bond_number, prize_amount")
    .in("bond_number", candidates);
  if (error) throw error;
  const matches = (matchesData ?? []) as WinnerRow[];
  if (matches.length === 0) return [];

  const drawIds = [...new Set(matches.map((m) => m.draw_id))];
  const [denominations, cities, { data: drawsData, error: drawsErr }] = await Promise.all([
    getPrizeBondDenominations(),
    getCities(),
    supabase
      .from("prize_bond_draws")
      .select("id, denomination_id, draw_number, city_id, draw_date, status")
      .in("id", drawIds),
  ]);
  if (drawsErr) throw drawsErr;
  const draws = (drawsData ?? []) as DrawRow[];

  const results: (BondSearchResult | null)[] = matches.map((match) => {
      const draw = draws.find((d) => d.id === match.draw_id);
      if (!draw) return null;
      const denomination = denominations.find((d) => d.id === draw.denomination_id);
      const city = cities.find((c) => c.id === draw.city_id);
      return {
        bondNumber: match.bond_number,
        denomination: denomination ? formatDenomination(denomination.face_value) : "Unknown",
        drawNumber: draw.draw_number,
        city: city?.name ?? "Unknown",
        date: formatDate(draw.draw_date),
        tier: match.prize_tier,
        prizeAmount: match.prize_amount ? `Rs. ${match.prize_amount.toLocaleString("en-PK")}` : undefined,
      } satisfies BondSearchResult;
  });
  return results
    .filter((r): r is BondSearchResult => r !== null)
    .sort((a, b) => a.tier - b.tier);
}
