import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, SourceRow } from "@/types/database";

/**
 * Every function here is wrapped in React's `cache()` — the
 * standard Next.js App Router pattern for de-duplicating identical
 * fetches within a single request. Several components on one page
 * (e.g. the homepage's MarketOverview, GoldSection, and
 * CategoryGrid) all need the `cities` table; without this, that's
 * 3+ duplicate round trips per request. With it, it's 1.
 *
 * Every function below has an EXPLICIT `Promise<...>` return type
 * and an explicit cast on its returned `data`, rather than left to
 * infer from the Supabase call chain. This isn't decorative: without
 * it, several of these were silently resolving to `never[]` for
 * every consumer (the same failure that surfaced on `getActiveSources`
 * and `getSystemAdminUser` during build verification) — declaring the
 * function's own signature is what guarantees the type every caller
 * actually sees, regardless of the client's internal generic
 * resolution for that specific call chain.
 */

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type GoldKaratRow = Database["public"]["Tables"]["gold_karats"]["Row"];
type SilverPurityRow = Database["public"]["Tables"]["silver_purities"]["Row"];
type CurrencyRow = Database["public"]["Tables"]["currencies"]["Row"];
type FuelTypeRow = Database["public"]["Tables"]["fuel_types"]["Row"];
type CryptoCoinRow = Database["public"]["Tables"]["crypto_coins"]["Row"];
type CementBrandRow = Database["public"]["Tables"]["cement_brands"]["Row"];
type SteelGradeRow = Database["public"]["Tables"]["steel_grades"]["Row"];
type PrizeBondDenominationRow = Database["public"]["Tables"]["prize_bond_denominations"]["Row"];

export const getCities = cache(async (): Promise<CityRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("cities").select("*").order("display_order");
  if (error) throw error;
  return (data ?? []) as CityRow[];
});

export const getGoldKarats = cache(async (): Promise<GoldKaratRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("gold_karats").select("*");
  if (error) throw error;
  return (data ?? []) as GoldKaratRow[];
});

export const getSilverPurities = cache(async (): Promise<SilverPurityRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("silver_purities").select("*");
  if (error) throw error;
  return (data ?? []) as SilverPurityRow[];
});

export const getCurrencies = cache(async (): Promise<CurrencyRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("currencies").select("*");
  if (error) throw error;
  return (data ?? []) as CurrencyRow[];
});

export const getFuelTypes = cache(async (): Promise<FuelTypeRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("fuel_types").select("*");
  if (error) throw error;
  return (data ?? []) as FuelTypeRow[];
});

export const getCryptoCoins = cache(async (): Promise<CryptoCoinRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("crypto_coins").select("*").order("rank");
  if (error) throw error;
  return (data ?? []) as CryptoCoinRow[];
});

export const getCementBrands = cache(async (): Promise<CementBrandRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("cement_brands").select("*");
  if (error) throw error;
  return (data ?? []) as CementBrandRow[];
});

export const getSteelGrades = cache(async (): Promise<SteelGradeRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("steel_grades").select("*");
  if (error) throw error;
  return (data ?? []) as SteelGradeRow[];
});

export const getPrizeBondDenominations = cache(async (): Promise<PrizeBondDenominationRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("prize_bond_denominations").select("*").order("face_value");
  if (error) throw error;
  return (data ?? []) as PrizeBondDenominationRow[];
});

/** Active sources only — matches the public RLS policy
 * (`is_active = true or is_admin_or_above()`); the admin pages
 * that also need inactive/deactivated sources use
 * lib/data/admin.ts's `getAllSources()` instead. */
export const getActiveSources = cache(async (): Promise<SourceRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("sources").select("*").eq("is_active", true);
  if (error) throw error;
  return (data ?? []) as SourceRow[];
});
