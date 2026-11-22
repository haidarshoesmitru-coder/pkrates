import type { MetadataRoute } from "next";
import { CATEGORY_META } from "@/lib/categories-static";
import { getSiteUrl } from "@/lib/site-url";
import { getPublishedPosts } from "@/lib/data/posts";

/**
 * Site-wide sitemap (Next.js supports one sitemap per route, so
 * this single file covers everything):
 * - homepage + the 8 category pages, generated from CATEGORY_META
 *   (lib/categories-static.ts) so adding a category stays a
 *   one-file change;
 * - the static public pages (news/blog indexes, about, contact,
 *   terms, license, privacy, sources);
 * - every published news/blog article, read live from the posts
 *   table. getPublishedPosts never throws — if the table or
 *   Supabase is unreachable the sitemap simply omits articles
 *   instead of failing.
 *
 * All URLs derive from getSiteUrl() (NEXT_PUBLIC_SITE_URL, falling
 * back to the current Vercel production URL) so the sitemap always
 * points at the domain the site is actually served from, and a
 * future custom domain works by changing one env var.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const homepage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_META.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: now,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/sources`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/license`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [newsPosts, blogPosts] = await Promise.all([
    getPublishedPosts("news", 500),
    getPublishedPosts("blog", 500),
  ]);

  const articlePages: MetadataRoute.Sitemap = [...newsPosts, ...blogPosts].map((post) => ({
    url: `${baseUrl}/${post.post_type}/${post.slug}`,
    lastModified: post.updated_at ?? post.published_at ?? now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...homepage, ...categoryPages, ...staticPages, ...articlePages];
}
