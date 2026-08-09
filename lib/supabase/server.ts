import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * The read client for Server Components and Route Handlers. Uses
 * the anon key, so every query runs through RLS exactly as an
 * anonymous or (once auth exists) signed-in visitor would see it —
 * this is deliberate: public rate pages should never read through
 * an elevated key, and admin read-only lists (dashboard, audit log,
 * sources, users) reuse this same client rather than a second one,
 * since RLS already grants those roles read access appropriately
 * (see 20260719091100_rls_policies.sql).
 *
 * Only lib/supabase/admin.ts (service-role, write-side) is
 * different, and only because there is no per-user auth session
 * yet to satisfy the write policies' `auth.uid()` checks — see that
 * file's header comment.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Called from a Server Component render, where cookies
            // can't be mutated — safe to ignore since middleware
            // (once auth exists) is what actually refreshes sessions.
          }
        },
      },
    }
  );
}
