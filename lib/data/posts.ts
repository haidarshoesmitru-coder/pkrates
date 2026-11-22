import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/posts-utils";
import type { PostRow } from "@/types/database";

export { formatPostDate, parsePostBody } from "@/lib/posts-utils";

export type PostType = "news" | "blog";

/**
 * Public reads for the News & Blog sections. These never throw:
 * before the posts migration is applied (or if Supabase is
 * unreachable) the pages render their honest empty state instead
 * of an error page.
 */
export async function getPublishedPosts(postType: PostType, limit = 30): Promise<PostRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("post_type", postType)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as PostRow[];
  } catch {
    return [];
  }
}

export async function getPublishedPostBySlug(postType: PostType, slug: string): Promise<PostRow | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("post_type", postType)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) return null;
    return (data as PostRow | null) ?? null;
  } catch {
    return null;
  }
}

/** Admin: every post, drafts included, newest first. */
export async function getAllPosts(): Promise<PostRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PostRow[];
}

export interface PostInput {
  id?: string;
  post_type: PostType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
}

/**
 * Same controlled-boundary pattern as lib/data/admin.ts's
 * asMutationClient: the hand-authored Database type's mutation
 * inference resolves to `never` for this table, so mutations go
 * through a minimal explicit interface instead of `any`.
 */
type PostsMutationClient = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    update: (patch: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
    delete: () => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { published_at: string | null; status: string } | null }>;
      };
    };
  };
};

function asPostsMutationClient(client: ReturnType<typeof createSupabaseAdminClient>): PostsMutationClient {
  return client as unknown as PostsMutationClient;
}

/** Admin write (service-role, same pattern as every other admin mutation). */
export async function savePost(input: PostInput): Promise<void> {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required.");
  const slug = slugify(input.slug || title);
  if (!slug) throw new Error("Slug is required.");
  const supabase = asPostsMutationClient(createSupabaseAdminClient());
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    post_type: input.post_type,
    slug,
    title,
    excerpt: input.excerpt.trim() || null,
    body: input.body,
    status: input.status,
    published_at: input.status === "published" ? now : null,
    updated_at: now,
  };
  if (input.id) {
    // Keep the original published_at when an already-published post is edited.
    const { data: existing } = await supabase.from("posts").select("published_at, status").eq("id", input.id).maybeSingle();
    if (existing?.status === "published" && input.status === "published" && existing.published_at) {
      row.published_at = existing.published_at;
    }
    const { error } = await supabase.from("posts").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("posts").insert(row);
    if (error) throw new Error(error.message);
  }
}

export async function deletePost(id: string): Promise<void> {
  const supabase = asPostsMutationClient(createSupabaseAdminClient());
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}


