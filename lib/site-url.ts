/**
 * The site's public base URL, used wherever an absolute URL is
 * required (sitemap, robots.txt, metadataBase for canonical/OG
 * resolution).
 *
 * Set NEXT_PUBLIC_SITE_URL in the deployment environment to the
 * real public origin (e.g. https://pkrates.com once that domain is
 * live). Until then it falls back to the current Vercel production
 * URL so absolute URLs are always correct for where the site is
 * actually served from — never a domain that doesn't resolve to
 * this deployment.
 */
const FALLBACK_SITE_URL = "https://pkrates-app.vercel.app";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return FALLBACK_SITE_URL;
}
