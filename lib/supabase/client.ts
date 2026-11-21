import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Browser-side client — used only by client components that need to
 * call Supabase Auth directly (currently: the admin login form).
 * Reads/writes everywhere else go through lib/supabase/server.ts
 * (Server Components) or lib/supabase/admin.ts (Server Action
 * mutations), per those files' own header comments. This client is
 * anon-key only and never touches the service-role key.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
