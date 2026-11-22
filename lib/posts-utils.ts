/**
 * Pure helpers for News/Blog posts — safe to import from client
 * components (no Supabase / next/headers imports here).
 */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Split a post body into blocks: "## " lines become headings, blank lines separate paragraphs. */
export function parsePostBody(body: string): { type: "h2" | "p"; text: string }[] {
  return body
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith("## ")
        ? { type: "h2" as const, text: block.slice(3).trim() }
        : { type: "p" as const, text: block.replace(/\n/g, " ") }
    );
}
