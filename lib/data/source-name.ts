import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getLatestSourceName(domain: "gold" | "silver"): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const latest =
    domain === "gold"
      ? await supabase
          .from("gold_rates")
          .select("source_id")
          .eq("status", "published")
          .order("effective_at", { ascending: false })
          .limit(1)
          .returns<{ source_id: string }[]>()
      : await supabase
          .from("silver_rates")
          .select("source_id")
          .eq("status", "published")
          .order("effective_at", { ascending: false })
          .limit(1)
          .returns<{ source_id: string }[]>();
  const sourceId = latest.data?.[0]?.source_id;
  if (!sourceId) return "Verified sources";
  const { data } = await supabase
    .from("sources")
    .select("name")
    .eq("id", sourceId)
    .maybeSingle()
    .returns<{ name: string }>();
  return data?.name ?? "Verified sources";
}
