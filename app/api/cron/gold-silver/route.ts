import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const GRAMS_PER_TOLA = 11.6638038;
const SARAFA_BASE = "https://api.sarafa.pk/api/v1/public-rates";

interface SarafaGoldRow {
  slug: string;
  rate_24k_tola: number;
}
interface SarafaSilverRow {
  slug: string;
  rate_tola: number;
}

async function fetchSarafa<T>(metal: "gold" | "silver", slugs: string[]): Promise<T[]> {
  const res = await fetch(
    `${SARAFA_BASE}/${metal}/cities?slugs=${slugs.join(",")}`,
    {
      headers: { "X-API-Key": process.env.SARAFA_API_KEY!, "X-Client-Platform": "server" },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Sarafa ${metal} request failed: ${res.status}`);
  const json = await res.json();
  return json.data as T[];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: cities, error: citiesError } = await supabase
    .from("cities")
    .select("id, slug")
    .returns<{ id: number; slug: string }[]>();
  if (citiesError) return NextResponse.json({ error: citiesError.message }, { status: 500 });

  const { data: karats, error: karatsError } = await supabase
    .from("gold_karats")
    .select("id, purity_fraction")
    .returns<{ id: number; purity_fraction: number }[]>();
  if (karatsError) return NextResponse.json({ error: karatsError.message }, { status: 500 });

  const { data: purities, error: puritiesError } = await supabase
    .from("silver_purities")
    .select("id, purity_fraction")
    .returns<{ id: number; purity_fraction: number }[]>();
  if (puritiesError) return NextResponse.json({ error: puritiesError.message }, { status: 500 });

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .select("id")
    .eq("name", "Sarafa.pk (Aggregator API)")
    .maybeSingle()
    .returns<{ id: string }>();
  if (sourceError || !source) {
    return NextResponse.json(
      { error: sourceError?.message ?? "'Sarafa.pk (Aggregator API)' source not found — run the setup SQL first." },
      { status: 500 }
    );
  }

  const slugs = cities.map((c) => c.slug);
  const [goldRows, silverRows] = await Promise.all([
    fetchSarafa<SarafaGoldRow>("gold", slugs),
    fetchSarafa<SarafaSilverRow>("silver", slugs),
  ]);

  const goldByslug = new Map(goldRows.map((r) => [r.slug, r.rate_24k_tola]));
  const silverBySlug = new Map(silverRows.map((r) => [r.slug, r.rate_tola]));
  const GOLD_24K_PURITY = 0.9999;
  const SILVER_999_PURITY = 0.999;

  const goldInserts: Record<string, unknown>[] = [];
  for (const city of cities) {
    const base24k = goldByslug.get(city.slug);
    if (!base24k) continue;
    for (const karat of karats) {
      const ratePerTola = Math.round(base24k * (karat.purity_fraction / GOLD_24K_PURITY));
      goldInserts.push({
        city_id: city.id,
        karat_id: karat.id,
        rate_per_tola: ratePerTola,
        rate_per_10g: Math.round((ratePerTola / GRAMS_PER_TOLA) * 10 * 100) / 100,
        rate_per_gram: Math.round((ratePerTola / GRAMS_PER_TOLA) * 100) / 100,
        source_id: source.id,
        submitted_by: null,
        approved_by: null,
        effective_at: new Date().toISOString(),
      });
    }
  }

  const silverInserts: Record<string, unknown>[] = [];
  for (const city of cities) {
    const base999 = silverBySlug.get(city.slug);
    if (!base999) continue;
    for (const purity of purities) {
      const ratePerTola = Math.round(base999 * (purity.purity_fraction / SILVER_999_PURITY));
      silverInserts.push({
        city_id: city.id,
        purity_id: purity.id,
        rate_per_tola: ratePerTola,
        rate_per_10g: Math.round((ratePerTola / GRAMS_PER_TOLA) * 10 * 100) / 100,
        rate_per_gram: Math.round((ratePerTola / GRAMS_PER_TOLA) * 100) / 100,
        source_id: source.id,
        submitted_by: null,
        approved_by: null,
        effective_at: new Date().toISOString(),
      });
    }
  }

  const { error: goldInsertError } = await supabase.from("gold_rates").insert(goldInserts as never[]);
  if (goldInsertError) return NextResponse.json({ error: goldInsertError.message }, { status: 500 });

  const { error: silverInsertError } = await supabase.from("silver_rates").insert(silverInserts as never[]);
  if (silverInsertError) return NextResponse.json({ error: silverInsertError.message }, { status: 500 });

  await supabase.rpc("refresh_current_rate_view", { view_name: "current_gold_rates" } as never);
  await supabase.rpc("refresh_current_rate_view", { view_name: "current_silver_rates" } as never);

  return NextResponse.json({
    goldInserted: goldInserts.length,
    silverInserted: silverInserts.length,
    citiesCovered: { gold: goldByslug.size, silver: silverBySlug.size, total: cities.length },
    at: new Date().toISOString(),
  });
}
