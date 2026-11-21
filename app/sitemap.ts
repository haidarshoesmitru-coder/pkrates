import type { MetadataRoute } from "next";
import { CATEGORY_META } from "@/lib/categories-static";

/**
 * No sitemap existed anywhere in the project before this file
 * (confirmed by reviewing the project before writing any code —
 * this was also flagged in the earlier production-readiness
 * audit as a missing SEO item). It has to be a single, site-wide
 * file — Next.js's `app/sitemap.ts` convention only supports one
 * sitemap per route, not a per-category one — so this is the
 * minimum one new file needed, and it's built to require zero
 * future edits when a category is added or removed: every entry
 * below the homepage is generated from `CATEGORY_META`
 * (lib/categories-static.ts) — the same static routing list that
 * also drives RelatedCategories and lib/search.ts, so adding a
 * category is a one-file change, not three.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pkrates.pk";

  const homepage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_META.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [...homepage, ...categoryPages];
}
