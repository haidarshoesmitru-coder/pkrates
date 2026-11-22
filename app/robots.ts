import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * robots.txt: everything public is crawlable; the admin panel and
 * API routes are not. The sitemap URL uses the same site-URL
 * helper as app/sitemap.ts so it always points at the domain the
 * site is actually served from.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
