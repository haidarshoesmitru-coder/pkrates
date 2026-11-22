"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Newspaper, Plus, Pencil, Trash2, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { savePostAction, deletePostAction } from "@/lib/data/admin-actions";
import { slugify, formatPostDate } from "@/lib/posts-utils";
import type { PostType } from "@/lib/data/posts";
import type { PostRow } from "@/types/database";

const inputCls =
  "w-full rounded-lg border border-ink-200 dark:border-ink-800 bg-[var(--surface)] px-3 py-2 text-sm text-ink-900 dark:text-ink-100 outline-none focus:border-pulse-500";
const labelCls = "block text-sm font-medium text-ink-700 dark:text-ink-300 mb-1.5";

interface FormState {
  id?: string;
  post_type: PostType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
}

const emptyForm: FormState = { post_type: "news", title: "", slug: "", excerpt: "", body: "", status: "draft" };

export function PostsManager({ posts, loadError }: { posts: PostRow[]; loadError?: boolean }) {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"all" | PostType>("all");

  const visible = filter === "all" ? posts : posts.filter((p) => p.post_type === filter);

  function startEdit(post: PostRow) {
    setActionError(null);
    setForm({
      id: post.id,
      post_type: post.post_type,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      body: post.body,
      status: post.status,
    });
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await savePostAction({
        id: form.id,
        post_type: form.post_type,
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        body: form.body,
        status: form.status,
      });
      if (res.error) {
        setActionError(res.error);
        return;
      }
      setForm(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: PostRow) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    setActionError(null);
    try {
      const res = await deletePostAction(post.id);
      if (res.error) setActionError(res.error);
      else router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (loadError) {
    return (
      <div className="p-5 sm:p-8">
        <Card className="p-4 border-fall-500/40 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-fall-500 shrink-0 mt-0.5" />
            <p className="text-sm text-fall-700 dark:text-red-300">
              Posts could not be loaded. If the posts table has not been created yet, run the
              migration <code>20261122210000_posts.sql</code> in the Supabase SQL Editor first.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 pb-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pulse-100 dark:bg-pulse-950 text-pulse-600 dark:text-pulse-400">
            <Newspaper className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-950 dark:text-white">News &amp; Blog Posts</h2>
            <p className="text-sm text-ink-500 dark:text-ink-400">
              Write rate news and evergreen guides. Published posts appear on /news and /blog.
            </p>
          </div>
        </div>
        <Button onClick={() => { setActionError(null); setForm(emptyForm); }}>
          <Plus className="h-4 w-4 mr-1.5" /> New Post
        </Button>
      </div>

      {actionError && (
        <Card className="p-4 border-fall-500/40 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-fall-500 shrink-0 mt-0.5" />
            <p className="text-sm text-fall-700 dark:text-red-300">{actionError}</p>
          </div>
        </Card>
      )}

      {form && (
        <Card className="p-5 sm:p-6 space-y-4">
          <h3 className="font-display text-base font-semibold text-ink-950 dark:text-white">
            {form.id ? "Edit Post" : "New Post"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Section</label>
              <select
                className={inputCls}
                value={form.post_type}
                onChange={(e) => setForm({ ...form, post_type: e.target.value as PostType })}
              >
                <option value="news">News</option>
                <option value="blog">Blog / Guide</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FormState["status"] })}
              >
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })}
              placeholder="e.g. Gold 24K at Rs 376,336 per tola"
            />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="gold-24k-rs-376336-22-nov-2026"
            />
          </div>
          <div>
            <label className={labelCls}>Excerpt (shown on listing pages)</label>
            <input
              className={inputCls}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="One or two short sentences."
            />
          </div>
          <div>
            <label className={labelCls}>Body</label>
            <textarea
              className={cn(inputCls, "min-h-48 leading-relaxed")}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={"Write paragraphs separated by a blank line.\nStart a line with ## to make a heading."}
            />
            <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-500">
              Separate paragraphs with a blank line. Start a line with <code>## </code> for a heading.
              Only publish figures from a named source (SBP, NBP, APSGJA/Sarafa, OGRA, National Savings).
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {form.status === "published" ? "Save & Publish" : "Save Draft"}
            </Button>
            <Button variant="ghost" onClick={() => setForm(null)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-2">
        {(["all", "news", "blog"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "news" ? "News" : "Blog"}
          </Button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        {visible.length === 0 ? (
          <p className="p-5 text-sm text-ink-400">No posts yet. Click “New Post” to write the first one.</p>
        ) : (
          <ul className="divide-y divide-ink-100 dark:divide-ink-800">
            {visible.map((post) => (
              <li key={post.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">{post.title}</p>
                  <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">
                    /{post.post_type}/{post.slug}
                    {post.published_at ? ` · ${formatPostDate(post.published_at)}` : ""}
                  </p>
                </div>
                <Badge variant="outline">{post.post_type === "news" ? "News" : "Blog"}</Badge>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    post.status === "published" ? "text-pulse-600 dark:text-pulse-400" : "text-ink-400"
                  )}
                >
                  {post.status === "published" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {post.status === "published" ? "Live" : "Draft"}
                </span>
                <Button size="sm" variant="ghost" onClick={() => startEdit(post)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(post)} disabled={deletingId === post.id}>
                  {deletingId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
