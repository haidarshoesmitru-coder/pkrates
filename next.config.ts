import type { NextConfig } from "next";

/**
 * Security headers (audit Minor #4, 22 Nov 2026).
 *
 * CSP notes — written to match what the site actually loads:
 * - Fonts come from next/font/google, which self-hosts them under
 *   /_next/static at build time, so font-src 'self' is enough.
 * - The only cross-origin browser calls are the Supabase client
 *   (auth/realtime), hence connect-src for *.supabase.co.
 * - 'unsafe-inline' for script/style is required by Next.js
 *   (inline bootstrap + JSON-LD + inline styles) without a
 *   nonce pipeline; no external script/style origins are allowed.
 * - All other external APIs (CoinGecko, exchangerate-api, Sarafa)
 *   are called server-side from cron routes, where CSP does not
 *   apply.
 * If an external embed/script is ever added, extend the relevant
 * directive here rather than loosening default-src.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
