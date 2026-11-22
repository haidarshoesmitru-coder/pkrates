import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPostDate, parsePostBody, type PostType } from "@/lib/data/posts";
import type { PostRow } from "@/types/database";

export function PostArticle({ postType, post }: { postType: PostType; post: PostRow }) {
  const blocks = parsePostBody(post.body);
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href={`/${postType}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-pulse-600 dark:text-pulse-400"
      >
        <ArrowLeft className="h-4 w-4" />
        {postType === "news" ? "All News" : "All Guides"}
      </Link>
      <p className="mt-8 text-xs font-medium uppercase tracking-wide text-pulse-600 dark:text-pulse-400">
        {formatPostDate(post.published_at)}
      </p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        {post.title}
      </h1>
      {post.excerpt && (
        <p className="mt-4 text-base leading-relaxed text-ink-500 dark:text-ink-400">{post.excerpt}</p>
      )}
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
        {blocks.map((block, i) =>
          block.type === "h2" ? (
            <h2 key={i} className="pt-4 font-display text-xl font-semibold text-ink-950 dark:text-white">
              {block.text}
            </h2>
          ) : (
            <p key={i}>{block.text}</p>
          )
        )}
      </div>
      <p className="mt-12 border-t border-ink-200 dark:border-ink-800 pt-6 text-xs leading-relaxed text-ink-400 dark:text-ink-500">
        Rates mentioned here are for information only and come from the named sources shown on our{" "}
        <Link href="/sources" className="underline underline-offset-2 hover:text-pulse-600">
          Sources &amp; Methodology
        </Link>{" "}
        page. Always confirm the current rate with your bank or dealer before any transaction.
      </p>
    </div>
  );
}
