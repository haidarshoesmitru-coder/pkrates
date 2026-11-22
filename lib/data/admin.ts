import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCities, getGoldKarats, getSilverPurities, getCurrencies, getFuelTypes, getCementBrands, getSteelGrades, getPrizeBondDenominations, getActiveSources } from "@/lib/data/reference";
import type { FieldValue, PublishedRecord, Submission } from "@/types/admin";
import type { SourceRow, AuditLogRow } from "@/types/database";

/**
 * Every write in this file goes through the service-role client —
 * see lib/supabase/admin.ts's header comment for exactly why (no
 * Supabase Auth session exists yet to satisfy the RLS write
 * policies). Reads use the ordinary RLS-respecting server client.
 */

interface SystemAdminUser {
  id: string;
  full_name: string;
  email: string;
}

/**
 * Same fix pattern as getActiveSources() in lib/data/reference.ts:
 * explicit return type + a precise assertion on `data`, rather than
 * relying on the Supabase client's generic resolution for this
 * specific `.select(...).maybeSingle()` chain — which was collapsing
 * to `never` here too, for the same underlying reason.
 */
async function getSystemAdminUser(): Promise<SystemAdminUser> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("email", "admin@pkrates.pk")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      "No system admin user found (expected a seeded users row for admin@pkrates.pk — see supabase/README.md's one-time setup step)."
    );
  }
  return data as SystemAdminUser;
}
export { getSystemAdminUser };

// ---------------------------------------------------------------
// Per-domain adapters — the one place that knows each domain's
// column names, mirroring the shape of the promote_*_submission()
// SQL functions in supabase/migrations.
// ---------------------------------------------------------------
/**
 * Narrowed to only the tables this file actually queries dynamically
 * (6 fact tables, 6 submission tables — prize_bond_draws/submissions
 * are handled via the separate PRIZE_BOND_ADAPTER below). Deliberately
 * NOT the full `keyof Database["public"]["Tables"]` union: that would
 * include ~20 unrelated tables (cities, roles, sources, ...) that
 * don't share columns like `status`/`reviewed_by` with the submission
 * tables, which would make .select()/.update() type-check against a
 * far broader and less accurate union than what these functions
 * actually touch.
 */
type FactTableName = "gold_rates" | "silver_rates" | "currency_rates" | "fuel_prices" | "cement_rates" | "steel_rates";
type SubmissionTableName = "gold_rate_submissions" | "silver_rate_submissions" | "currency_rate_submissions" | "fuel_price_submissions" | "cement_rate_submissions" | "steel_rate_submissions";

interface DomainAdapter {
  factTable: FactTableName;
  submissionTable: SubmissionTableName;
  toFactFields: (row: Record<string, unknown>, refs: Refs) => FieldValue[];
  toSubmissionFields: (row: Record<string, unknown>, refs: Refs) => FieldValue[];
  buildInsert: (values: Record<string, string>, refs: Refs, sourceId: string, submittedBy: string) => Record<string, unknown>;
}

interface Refs {
  cities: { id: number; name: string }[];
  goldKarats: { id: number; label: string }[];
  silverPurities: { id: number; label: string }[];
  currencies: { id: number; code: string }[];
  fuelTypes: { id: number; name: string }[];
  cementBrands: { id: number; name: string }[];
  steelGrades: { id: number; label: string }[];
}

async function loadRefs(): Promise<Refs> {
  const [cities, goldKarats, silverPurities, currencies, fuelTypes, cementBrands, steelGrades] = await Promise.all([
    getCities(), getGoldKarats(), getSilverPurities(), getCurrencies(), getFuelTypes(), getCementBrands(), getSteelGrades(),
  ]);
  return { cities, goldKarats, silverPurities, currencies, fuelTypes, cementBrands, steelGrades };
}

const cityName = (refs: Refs, id: number) => refs.cities.find((c) => c.id === id)?.name ?? "Unknown";
const cityId = (refs: Refs, name: string) => refs.cities.find((c) => c.name === name)?.id;

/**
 * Both `submitRate` and `approveSubmission`/`rejectSubmission` write
 * to one of 7 structurally-different submission tables, selected at
 * runtime from a domain string. Supabase's generated Insert/Update
 * types for `.from(dynamicTableUnion)` don't reliably resolve to a
 * clean union across differently-shaped tables. Rather than an
 * `@ts-expect-error` comment — which itself becomes a NEW error
 * ("unused directive") if the exact inference happens to succeed
 * rather than fail — this helper asserts through `unknown` to a
 * minimal, explicit, precisely-typed interface describing exactly
 * the one method call each mutation needs. Deterministic regardless
 * of Supabase's exact generic resolution: not `any` (every field
 * here is still a real, checked type), just a controlled boundary
 * around the one place this file legitimately knows more than the
 * table-name union can statically express.
 */
type MutationClient = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    update: (patch: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};

function asMutationClient(client: ReturnType<typeof createSupabaseAdminClient>): MutationClient {
  return client as unknown as MutationClient;
}

const ADAPTERS: Record<string, DomainAdapter> = {
  gold: {
    factTable: "gold_rates",
    submissionTable: "gold_rate_submissions",
    toFactFields: (r, refs) => [
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "karat", value: refs.goldKarats.find((k) => k.id === r.karat_id)?.label ?? "" },
      { key: "ratePerTola", value: (r.rate_per_tola as number).toLocaleString("en-PK") },
    ],
    toSubmissionFields: (r, refs) => [
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "karat", value: refs.goldKarats.find((k) => k.id === r.karat_id)?.label ?? "" },
      { key: "ratePerTola", value: (r.rate_per_tola as number).toLocaleString("en-PK") },
    ],
    buildInsert: (v, refs, sourceId, submittedBy) => ({
      city_id: cityId(refs, v.city), karat_id: refs.goldKarats.find((k) => k.label === v.karat)?.id,
      rate_per_tola: Number(v.ratePerTola), source_id: sourceId, submitted_by: submittedBy,
    }),
  },
  silver: {
    factTable: "silver_rates",
    submissionTable: "silver_rate_submissions",
    toFactFields: (r, refs) => [
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "purity", value: refs.silverPurities.find((p) => p.id === r.purity_id)?.label ?? "" },
      { key: "ratePerTola", value: (r.rate_per_tola as number).toLocaleString("en-PK") },
    ],
    toSubmissionFields: (r, refs) => [
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "purity", value: refs.silverPurities.find((p) => p.id === r.purity_id)?.label ?? "" },
      { key: "ratePerTola", value: (r.rate_per_tola as number).toLocaleString("en-PK") },
    ],
    buildInsert: (v, refs, sourceId, submittedBy) => ({
      city_id: cityId(refs, v.city), purity_id: refs.silverPurities.find((p) => p.label === v.purity)?.id,
      rate_per_tola: Number(v.ratePerTola), source_id: sourceId, submitted_by: submittedBy,
    }),
  },
  currency: {
    factTable: "currency_rates",
    submissionTable: "currency_rate_submissions",
    toFactFields: (r, refs) => [
      { key: "currency", value: refs.currencies.find((c) => c.id === r.currency_id)?.code ?? "" },
      { key: "rateType", value: r.rate_type === "interbank" ? "Interbank" : "Open Market" },
      { key: "buyRate", value: (r.buy_rate as number).toFixed(2) },
      { key: "sellRate", value: (r.sell_rate as number).toFixed(2) },
    ],
    toSubmissionFields: (r, refs) => [
      { key: "currency", value: refs.currencies.find((c) => c.id === r.currency_id)?.code ?? "" },
      { key: "rateType", value: r.rate_type === "interbank" ? "Interbank" : "Open Market" },
      { key: "buyRate", value: (r.buy_rate as number).toFixed(2) },
      { key: "sellRate", value: (r.sell_rate as number).toFixed(2) },
    ],
    buildInsert: (v, refs, sourceId, submittedBy) => ({
      currency_id: refs.currencies.find((c) => c.code === v.currency)?.id,
      rate_type: v.rateType === "Interbank" ? "interbank" : "open_market",
      buy_rate: Number(v.buyRate), sell_rate: Number(v.sellRate), source_id: sourceId, submitted_by: submittedBy,
    }),
  },
  petrol: {
    factTable: "fuel_prices",
    submissionTable: "fuel_price_submissions",
    toFactFields: (r, refs) => [
      { key: "fuelType", value: refs.fuelTypes.find((f) => f.id === r.fuel_type_id)?.name ?? "" },
      { key: "pricePerLiter", value: (r.price_per_liter as number).toFixed(2) },
      { key: "notificationRef", value: (r.notification_reference as string) ?? "" },
      { key: "effectiveFrom", value: new Date(r.effective_from as string).toLocaleDateString("en-GB") },
    ],
    toSubmissionFields: (r, refs) => [
      { key: "fuelType", value: refs.fuelTypes.find((f) => f.id === r.fuel_type_id)?.name ?? "" },
      { key: "pricePerLiter", value: (r.price_per_liter as number).toFixed(2) },
      { key: "notificationRef", value: (r.notification_reference as string) ?? "" },
    ],
    buildInsert: (v, refs, sourceId, submittedBy) => ({
      fuel_type_id: refs.fuelTypes.find((f) => f.name === v.fuelType)?.id,
      price_per_liter: Number(v.pricePerLiter), notification_reference: v.notificationRef,
      effective_from: v.effectiveFrom || new Date().toISOString(), source_id: sourceId, submitted_by: submittedBy,
    }),
  },
  cement: {
    factTable: "cement_rates",
    submissionTable: "cement_rate_submissions",
    toFactFields: (r, refs) => [
      { key: "brand", value: refs.cementBrands.find((b) => b.id === r.brand_id)?.name ?? "" },
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "pricePerBag", value: (r.price_per_bag as number).toLocaleString("en-PK") },
    ],
    toSubmissionFields: (r, refs) => [
      { key: "brand", value: refs.cementBrands.find((b) => b.id === r.brand_id)?.name ?? "" },
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "pricePerBag", value: (r.price_per_bag as number).toLocaleString("en-PK") },
    ],
    buildInsert: (v, refs, sourceId, submittedBy) => ({
      brand_id: refs.cementBrands.find((b) => b.name === v.brand)?.id, city_id: cityId(refs, v.city),
      price_per_bag: Number(v.pricePerBag), source_id: sourceId, submitted_by: submittedBy,
    }),
  },
  steel: {
    factTable: "steel_rates",
    submissionTable: "steel_rate_submissions",
    toFactFields: (r, refs) => [
      { key: "grade", value: refs.steelGrades.find((g) => g.id === r.grade_id)?.label ?? "" },
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "pricePerMaund", value: (r.price_per_maund as number).toLocaleString("en-PK") },
      { key: "pricePerTon", value: (r.price_per_ton as number).toLocaleString("en-PK") },
    ],
    toSubmissionFields: (r, refs) => [
      { key: "grade", value: refs.steelGrades.find((g) => g.id === r.grade_id)?.label ?? "" },
      { key: "city", value: cityName(refs, r.city_id as number) },
      { key: "pricePerMaund", value: (r.price_per_maund as number).toLocaleString("en-PK") },
      { key: "pricePerTon", value: (r.price_per_ton as number).toLocaleString("en-PK") },
    ],
    buildInsert: (v, refs, sourceId, submittedBy) => ({
      grade_id: refs.steelGrades.find((g) => g.label === v.grade)?.id, city_id: cityId(refs, v.city),
      price_per_maund: Number(v.pricePerMaund), price_per_ton: Number(v.pricePerTon),
      source_id: sourceId, submitted_by: submittedBy,
    }),
  },
};

/** Prize Bonds has two submission flows (draws + winners), unlike
 * the six single-table domains above — RateDomainAdmin's generic
 * submit form maps to the draw-scheduling flow, matching what the
 * admin panel UI has always exposed for this domain. */
const PRIZE_BOND_ADAPTER: { factTable: "prize_bond_draws"; submissionTable: "prize_bond_draw_submissions" } = {
  factTable: "prize_bond_draws",
  submissionTable: "prize_bond_draw_submissions",
};

/** DB draw_status values are lowercase ('scheduled' | 'completed' |
 * 'postponed' | 'cancelled'); the admin form uses capitalized labels. */
const DRAW_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled", completed: "Completed", postponed: "Postponed", cancelled: "Cancelled",
};
const drawStatusLabel = (dbValue: string) => DRAW_STATUS_LABELS[dbValue] ?? dbValue;
const drawStatusDbValue = (label: string) => label.trim().toLowerCase();

/** "Rs. 1,500" (form option) -> 1500 (prize_bond_denominations.face_value). */
const denominationFaceValue = (label: string) => Number(label.replace(/[^0-9]/g, ""));
const denominationLabel = (faceValue: number) => `Rs. ${faceValue.toLocaleString("en-PK")}`;

function domainNameToRlsDomain(domain: string): string {
  return domain === "prize-bonds" ? "prize_bonds" : domain;
}

// ---------------------------------------------------------------
// Reads
// ---------------------------------------------------------------
export async function getPublishedRecords(domain: string): Promise<PublishedRecord[]> {
  const supabase = await createSupabaseServerClient();
  const [refs, sources] = await Promise.all([loadRefs(), getActiveSources()]);

  if (domain === "prize-bonds") {
    const denominations = await getPrizeBondDenominations();
    const { data, error } = await supabase
      .from("prize_bond_draws")
      .select("id, denomination_id, draw_number, city_id, draw_date, status, source_id, approved_by, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    const draws = (data ?? []) as {
      id: string; denomination_id: number; draw_number: number; city_id: number;
      draw_date: string; status: string; source_id: string | null; approved_by: string | null; created_at: string;
    }[];
    return draws.map((d) => ({
      id: d.id,
      fields: [
        { key: "denomination", value: denominationLabel(Number(denominations.find((dn) => dn.id === d.denomination_id)?.face_value ?? 0)) },
        { key: "drawNumber", value: String(d.draw_number) },
        { key: "city", value: cityName(refs, d.city_id) },
        { key: "drawDate", value: new Date(d.draw_date).toLocaleDateString("en-GB") },
        { key: "drawStatus", value: drawStatusLabel(d.status) },
      ],
      status: "published",
      sourceName: d.source_id ? sources.find((s) => s.id === d.source_id)?.name ?? "Unknown" : "—",
      approvedBy: d.approved_by ?? "—",
      effectiveAt: new Date(d.created_at).toLocaleString("en-GB"),
    }));
  }

  const adapter = ADAPTERS[domain];
  if (!adapter) return [];

  // fuel_prices has no effective_at column — it uses effective_from.
  const orderColumn = domain === "petrol" ? "effective_from" : "effective_at";
  const { data, error } = await supabase
    .from(adapter.factTable)
    .select("*")
    .eq("status", "published")
    .order(orderColumn, { ascending: false })
    .limit(20);
  if (error) throw error;
  const rows = (data ?? []) as Record<string, unknown>[];

  return rows.map((row) => ({
    id: row.id as string,
    fields: adapter.toFactFields(row, refs),
    status: "published",
    sourceName: sources.find((s) => s.id === row.source_id)?.name ?? "Unknown",
    approvedBy: (row.approved_by as string) ?? "—",
    effectiveAt: new Date((row.effective_at ?? row.effective_from) as string).toLocaleString("en-GB"),
  }));
}

export async function getPendingSubmissions(domain: string): Promise<Submission[]> {
  const supabase = await createSupabaseServerClient();
  const [refs, sources] = await Promise.all([loadRefs(), getActiveSources()]);
  const table = domain === "prize-bonds" ? PRIZE_BOND_ADAPTER.submissionTable : ADAPTERS[domain]?.submissionTable;
  if (!table) return [];

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .in("status", ["pending", "flagged_anomaly"])
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as Record<string, unknown>[];

  const denominations = domain === "prize-bonds" ? await getPrizeBondDenominations() : [];
  const toFields =
    domain === "prize-bonds"
      ? (r: Record<string, unknown>) => [
          { key: "denomination", value: denominationLabel(Number(denominations.find((dn) => dn.id === r.denomination_id)?.face_value ?? 0)) },
          { key: "drawNumber", value: String(r.draw_number) },
          { key: "city", value: cityName(refs, r.city_id as number) },
          { key: "drawDate", value: new Date(r.draw_date as string).toLocaleDateString("en-GB") },
          { key: "drawStatus", value: drawStatusLabel((r.draw_status as string) ?? "scheduled") },
        ]
      : (r: Record<string, unknown>) => ADAPTERS[domain].toSubmissionFields(r, refs);

  return rows.map((row) => ({
    id: row.id as string,
    fields: toFields(row),
    sourceName: sources.find((s) => s.id === row.source_id)?.name ?? "Unknown",
    submittedBy: (row.submitted_by as string) ?? "API",
    submittedAt: new Date(row.submitted_at as string).toLocaleString("en-GB"),
    status: row.status as Submission["status"],
    reviewerNotes: row.reviewer_notes as string | undefined,
    deviationNote: row.status === "flagged_anomaly" ? (row.reviewer_notes as string) : undefined,
  }));
}

// ---------------------------------------------------------------
// Writes (called by Server Actions — service-role client, see
// header comment)
// ---------------------------------------------------------------
export async function submitRate(domain: string, values: Record<string, string>, sourceId: string) {
  const [refs, systemAdmin] = await Promise.all([loadRefs(), getSystemAdminUser()]);
  const supabase = createSupabaseAdminClient();

  if (domain === "prize-bonds") {
    // Draw submissions live in their own table (no ADAPTERS entry).
    // Approving one fires promote_prize_bond_draw_submission(),
    // which copies draw_status into prize_bond_draws.status.
    const denominations = await getPrizeBondDenominations();
    const denominationId = denominations.find(
      (dn) => Number(dn.face_value) === denominationFaceValue(values.denomination ?? "")
    )?.id;
    if (!denominationId) throw new Error(`Submit failed (prize-bonds): unknown denomination "${values.denomination}"`);
    const payload = {
      denomination_id: denominationId,
      draw_number: Number(values.drawNumber),
      city_id: cityId(refs, values.city),
      draw_date: values.drawDate,
      draw_status: drawStatusDbValue(values.drawStatus ?? "Scheduled"),
      source_id: sourceId,
      submitted_by: systemAdmin.id,
    };
    const { error } = await asMutationClient(supabase).from(PRIZE_BOND_ADAPTER.submissionTable).insert(payload);
    if (error) throw new Error(`Submit failed (prize-bonds): ${error.message}`);
    return;
  }

  const adapter = ADAPTERS[domain];
  if (!adapter) throw new Error(`Unknown domain: ${domain}`);
  const payload = adapter.buildInsert(values, refs, sourceId, systemAdmin.id);
  const { error } = await asMutationClient(supabase).from(adapter.submissionTable).insert(payload);
  if (error) throw new Error(`Submit failed (${domain}): ${error.message}`);
}

export async function approveSubmission(domain: string, submissionId: string) {
  const table = domain === "prize-bonds" ? PRIZE_BOND_ADAPTER.submissionTable : ADAPTERS[domain]?.submissionTable;
  if (!table) throw new Error(`Unknown domain: ${domain}`);
  const systemAdmin = await getSystemAdminUser();
  const supabase = createSupabaseAdminClient();
  // Triggers the corresponding promote_*_submission() DB trigger,
  // which inserts the published fact row and writes the audit log
  // entry atomically — see supabase/migrations/20260719091000 and
  // 20260719091700.
  const { error } = await asMutationClient(supabase).from(table).update({ status: "approved", reviewed_by: systemAdmin.id }).eq("id", submissionId);
  if (error) throw new Error(`Approve failed (${domain}): ${error.message}`);
}

export async function rejectSubmission(domain: string, submissionId: string, notes: string) {
  const table = domain === "prize-bonds" ? PRIZE_BOND_ADAPTER.submissionTable : ADAPTERS[domain]?.submissionTable;
  if (!table) throw new Error(`Unknown domain: ${domain}`);
  const systemAdmin = await getSystemAdminUser();
  const supabase = createSupabaseAdminClient();
  const { error } = await asMutationClient(supabase)
    .from(table)
    .update({ status: "rejected", reviewed_by: systemAdmin.id, reviewer_notes: notes || "Rejected via admin panel" })
    .eq("id", submissionId);
  if (error) throw new Error(`Reject failed (${domain}): ${error.message}`);
}

// ---------------------------------------------------------------
// Prize Bond winners — the second prize-bond flow. Winners are
// entered per published draw as one JSON batch in
// prize_bond_winner_submissions; approving fires
// promote_prize_bond_winner_submission(), which expands the batch
// into prize_bond_winners rows.
// ---------------------------------------------------------------
export interface PrizeBondDrawOption {
  id: string;
  label: string;
}

export async function getPrizeBondDrawOptions(): Promise<PrizeBondDrawOption[]> {
  const supabase = await createSupabaseServerClient();
  const [refs, denominations] = await Promise.all([loadRefs(), getPrizeBondDenominations()]);
  const { data, error } = await supabase
    .from("prize_bond_draws")
    .select("id, denomination_id, draw_number, city_id, draw_date, status")
    .order("draw_date", { ascending: false })
    .limit(50);
  if (error) throw error;
  const draws = (data ?? []) as {
    id: string; denomination_id: number; draw_number: number; city_id: number; draw_date: string; status: string;
  }[];
  return draws.map((d) => ({
    id: d.id,
    label: `${denominationLabel(Number(denominations.find((dn) => dn.id === d.denomination_id)?.face_value ?? 0))} · Draw #${d.draw_number} · ${cityName(refs, d.city_id)} · ${new Date(d.draw_date).toLocaleDateString("en-GB")} (${drawStatusLabel(d.status)})`,
  }));
}

export async function submitPrizeBondWinners(
  drawId: string,
  prizeTier: number,
  prizeAmount: string,
  bondNumbers: string[],
  sourceId: string
) {
  const systemAdmin = await getSystemAdminUser();
  const supabase = createSupabaseAdminClient();
  const winnersPayload = bondNumbers.map((bondNumber) => ({
    prize_tier: prizeTier,
    bond_number: bondNumber,
    prize_amount: prizeAmount ? Number(prizeAmount) : null,
  }));
  const { error } = await asMutationClient(supabase).from("prize_bond_winner_submissions").insert({
    draw_id: drawId,
    source_id: sourceId,
    winners_payload: winnersPayload as unknown as Record<string, unknown>,
    submitted_by: systemAdmin.id,
  });
  if (error) throw new Error(`Winners submit failed: ${error.message}`);
}

export interface PendingWinnerSubmission {
  id: string;
  drawLabel: string;
  winnersCount: number;
  bondNumbers: string[];
  sourceName: string;
  submittedAt: string;
  status: Submission["status"];
}

export async function getPendingWinnerSubmissions(): Promise<PendingWinnerSubmission[]> {
  const supabase = await createSupabaseServerClient();
  const [sources, drawOptions] = await Promise.all([getActiveSources(), getPrizeBondDrawOptions()]);
  const { data, error } = await supabase
    .from("prize_bond_winner_submissions")
    .select("id, draw_id, source_id, winners_payload, winners_count, submitted_at, status")
    .in("status", ["pending", "flagged_anomaly"])
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as {
    id: string; draw_id: string; source_id: string;
    winners_payload: { bond_number?: string }[]; winners_count: number | null;
    submitted_at: string; status: Submission["status"];
  }[];
  return rows.map((r) => ({
    id: r.id,
    drawLabel: drawOptions.find((d) => d.id === r.draw_id)?.label ?? "Unknown draw",
    winnersCount: r.winners_count ?? (Array.isArray(r.winners_payload) ? r.winners_payload.length : 0),
    bondNumbers: Array.isArray(r.winners_payload) ? r.winners_payload.map((w) => w.bond_number ?? "") : [],
    sourceName: sources.find((s) => s.id === r.source_id)?.name ?? "Unknown",
    submittedAt: new Date(r.submitted_at).toLocaleString("en-GB"),
    status: r.status,
  }));
}

export async function approveWinnerSubmission(submissionId: string) {
  const systemAdmin = await getSystemAdminUser();
  const supabase = createSupabaseAdminClient();
  const { error } = await asMutationClient(supabase)
    .from("prize_bond_winner_submissions")
    .update({ status: "approved", reviewed_by: systemAdmin.id })
    .eq("id", submissionId);
  if (error) throw new Error(`Winners approve failed: ${error.message}`);
}

export async function rejectWinnerSubmission(submissionId: string, notes: string) {
  const systemAdmin = await getSystemAdminUser();
  const supabase = createSupabaseAdminClient();
  const { error } = await asMutationClient(supabase)
    .from("prize_bond_winner_submissions")
    .update({ status: "rejected", reviewed_by: systemAdmin.id, reviewer_notes: notes || "Rejected via admin panel" })
    .eq("id", submissionId);
  if (error) throw new Error(`Winners reject failed: ${error.message}`);
}

export { domainNameToRlsDomain };

// ---------------------------------------------------------------
// Governance: sources, audit log, users, dashboard, history
// ---------------------------------------------------------------
export async function getAllSources(): Promise<SourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("sources").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as SourceRow[];
}

export async function toggleSourceAutoPublish(sourceId: string, allow: boolean) {
  const supabase = createSupabaseAdminClient();
  const { error } = await asMutationClient(supabase)
    .from("sources")
    .update({ ingestion_mode: allow ? "api_auto" : "manual_reviewed" })
    .eq("id", sourceId);
  if (error) throw error;
}

export async function getAuditLog(filters?: { domain?: string; action?: string; query?: string }): Promise<(AuditLogRow & { performedByName: string })[]> {
  const supabase = await createSupabaseServerClient();
  let request = supabase.from("audit_logs").select("*").order("performed_at", { ascending: false }).limit(100);
  if (filters?.domain && filters.domain !== "all") request = request.eq("domain", filters.domain);
  if (filters?.action && filters.action !== "all") request = request.eq("action", filters.action);
  const { data, error } = await request;
  if (error) throw error;

  const [users] = await Promise.all([getAllUsers()]);
  const withNames = ((data ?? []) as AuditLogRow[]).map((entry) => ({
    ...entry,
    performedByName: entry.performed_by
      ? users.find((u) => u.id === entry.performed_by)?.name ?? "Unknown user"
      : entry.performed_by_system ?? "System",
  }));

  if (!filters?.query) return withNames;
  const q = filters.query.toLowerCase();
  return withNames.filter(
    (e) => e.entity_table.toLowerCase().includes(q) || (e.notes ?? "").toLowerCase().includes(q) || e.performedByName.toLowerCase().includes(q)
  );
}

interface UserWithRelations {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  updated_at: string;
  role_id: number;
  roles: { name: string } | null;
  user_domain_access: { domain: string }[] | null;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastActive: string;
  role: string;
  domains: string[];
}

export async function getAllUsers(): Promise<AdminUserSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, is_active, updated_at, role_id, roles(name), user_domain_access!user_domain_access_user_id_fkey(domain)");
  if (error) throw error;
  return ((data ?? []) as unknown as UserWithRelations[]).map((u) => ({
    id: u.id,
    name: u.full_name,
    email: u.email,
    isActive: u.is_active,
    lastActive: new Date(u.updated_at).toLocaleString("en-GB"),
    role: u.roles?.name ?? "editor",
    domains: (u.user_domain_access ?? []).map((d) => d.domain),
  }));
}

export async function updateUserRole(userId: string, roleName: string) {
  const supabase = createSupabaseAdminClient();
  const { data: roleData, error: roleErr } = await supabase.from("roles").select("id").eq("name", roleName).maybeSingle();
  if (roleErr) throw roleErr;
  const role = roleData as { id: number } | null;
  if (!role) throw new Error(`Unknown role: ${roleName}`);
  const { error } = await asMutationClient(supabase).from("users").update({ role_id: role.id }).eq("id", userId);
  if (error) throw error;
}

const ALL_DOMAINS = ["gold", "silver", "currency", "petrol", "prize-bonds", "cement", "steel"];

export async function getDashboardStats() {
  const supabase = await createSupabaseServerClient();

  const perDomain = await Promise.all(
    ALL_DOMAINS.map(async (domain) => {
      const subs = await getPendingSubmissions(domain);
      return {
        domain,
        count: subs.length,
        flagged: subs.filter((s) => s.status === "flagged_anomaly").length,
      };
    })
  );
  const totalPending = perDomain.reduce((sum, d) => sum + d.count, 0);
  const flagged = perDomain.reduce((sum, d) => sum + d.flagged, 0);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count: publishedToday } = await supabase
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .in("action", ["approve", "auto_publish"])
    .gte("performed_at", since.toISOString());

  return {
    totalPending,
    flagged,
    publishedToday: publishedToday ?? 0,
    staleDomains: [] as { domain: string; hoursStale: number }[],
    avgApprovalMinutes: null as number | null, // requires a dedicated aggregation query; not yet computed
    pendingByDomain: Object.fromEntries(perDomain.map((d) => [d.domain, d.count])),
  };
}

/** Cross-domain "what actually went live" timeline for the Update
 * History page — reads the same audit_logs rows the Audit Log page
 * does, filtered to publish events only. */
export async function getUpdateHistory(): Promise<(AuditLogRow & { performedByName: string })[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .in("action", ["approve", "auto_publish"])
    .order("performed_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  const users = await getAllUsers();
  return ((data ?? []) as AuditLogRow[]).map((entry) => ({
    ...entry,
    performedByName: entry.performed_by
      ? users.find((u) => u.id === entry.performed_by)?.name ?? "Unknown user"
      : entry.performed_by_system ?? "System",
  }));
}

/** Cross-domain recent activity feed for the dashboard — same
 * summary-building approach as getDomainHistory, but unfiltered by
 * domain and covering every action type. */
export interface RecentActivityEntry {
  id: string;
  summary: string;
  action: ActivityAction;
  performedBy: string;
  performedAt: string;
}

export async function getRecentActivity(): Promise<RecentActivityEntry[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("performed_at", { ascending: false })
    .limit(10);
  if (error) throw error;

  const users = await getAllUsers();
  return ((data ?? []) as AuditLogRow[]).map((entry) => {
    const newVal = entry.new_value as Record<string, unknown> | null;
    const summaryFromFields = newVal
      ? Object.entries(newVal)
          .filter(([k]) => !["__table__", "published_id", "flagged"].includes(k))
          .map(([, v]) => String(v))
          .slice(0, 4)
          .join(" · ")
      : entry.entity_table;
    const verb: Record<string, string> = {
      insert: "submitted", approve: "approved", reject: "rejected", correct: "corrected",
      verify: "flagged for review", auto_publish: "auto-published", update: "updated", deactivate: "deactivated",
    };
    return {
      id: String(entry.id),
      summary: `${summaryFromFields} ${verb[entry.action] ?? entry.action}`,
      action: entry.action as ActivityAction,
      performedBy: entry.performed_by ? users.find((u) => u.id === entry.performed_by)?.name ?? "Unknown user" : entry.performed_by_system ?? "System",
      performedAt: new Date(entry.performed_at).toLocaleString("en-GB"),
    };
  });
}

type ActivityAction = "approve" | "reject" | "correct" | "insert" | "update" | "verify" | "auto_publish" | "deactivate";

/** Domain-scoped insert/approve/reject history for RateDomainAdmin's
 * History tab — reads the same audit_logs the global Audit Log page
 * does, filtered and formatted for this narrower view. */
export interface DomainHistoryEntry {
  id: string;
  summary: string;
  action: "insert" | "approve" | "reject";
  by: string;
  at: string;
  notes?: string;
}

export async function getDomainHistory(domain: string): Promise<DomainHistoryEntry[]> {
  const supabase = await createSupabaseServerClient();
  const rlsDomain = domainNameToRlsDomain(domain);
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("domain", rlsDomain)
    .in("action", ["insert", "approve", "reject"])
    .order("performed_at", { ascending: false })
    .limit(30);
  if (error) throw error;

  const users = await getAllUsers();
  return ((data ?? []) as AuditLogRow[]).map((entry) => {
    const newVal = entry.new_value as Record<string, unknown> | null;
    const summaryFromFields = newVal
      ? Object.entries(newVal)
          .filter(([k]) => !["__table__", "published_id"].includes(k))
          .map(([, v]) => String(v))
          .slice(0, 4)
          .join(" · ")
      : entry.entity_table;
    return {
      id: String(entry.id),
      summary: `${summaryFromFields} ${entry.action === "insert" ? "submitted for review" : entry.action === "approve" ? "approved" : "rejected"}`,
      action: entry.action as "insert" | "approve" | "reject",
      by: entry.performed_by ? users.find((u) => u.id === entry.performed_by)?.name ?? "Unknown user" : entry.performed_by_system ?? "System",
      at: new Date(entry.performed_at).toLocaleString("en-GB"),
      notes: entry.notes ?? undefined,
    };
  });
}
