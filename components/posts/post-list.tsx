import Link from "next/link";
import { formatPostDate, type PostType } from "@/lib/data/posts";
import type { PostRow } from "@/types/database";

export function PostList({
  postType,
  title,
  intro,
  posts,
}: {
  postType: PostType;
  title: string;
  intro: string;
  posts: PostRow[];
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">{intro}</p>

      {posts.length === 0 ? (
        <div className="mt-12 rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-8 text-center">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Nothing here yet — check back soon. In the meantime, today&rsquo;s rates are on the{" "}
            <Link href="/" className="text-pulse-600 dark:text-pulse-400 underline">
              homepage
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${postType}/${post.slug}`}
              className="block rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-5 sm:p-6 hover:border-pulse-400 dark:hover:border-pulse-600"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-pulse-600 dark:text-pulse-400">
                {formatPostDate(post.published_at)}
              </p>
              <h2 className="mt-1.5 font-display text-lg sm:text-xl font-semibold text-ink-950 dark:text-white">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
