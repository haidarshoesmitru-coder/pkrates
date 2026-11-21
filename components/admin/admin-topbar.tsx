import { Bell, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleBadge } from "@/components/admin/role-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/data/admin-actions";
import type { UserRole } from "@/types/admin";

/**
 * Converted from a client component to an async Server Component —
 * it never actually needed client-side interactivity itself
 * (ThemeToggle is already its own "use client" island), and fetching
 * the current admin user here directly means none of the 13 admin
 * pages that render <AdminTopbar /> need to be threaded with a user
 * prop just to display who's signed in.
 *
 * Now reads the real signed-in Auth user's email (middleware.ts
 * guarantees one exists for every route this renders on) instead of
 * hardcoding admin@pkrates.pk, falling back to that seeded identity
 * only if no `users` row matches the Auth email yet. Write
 * attribution itself is unchanged (still documented in
 * lib/supabase/admin.ts) — this only fixes what name/role is shown.
 */
interface AdminIdentityRow {
  full_name: string;
  roles: { name: string } | null;
}

async function getCurrentAdminIdentity() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const email = authUser?.email ?? "admin@pkrates.pk";

    const { data } = await supabase
      .from("users")
      .select("full_name, roles(name)")
      .eq("email", email)
      .maybeSingle();
    if (!data) return { name: authUser?.email ?? "Admin", role: "admin" as UserRole };
    const row = data as unknown as AdminIdentityRow;
    return {
      name: row.full_name,
      role: (row.roles?.name ?? "admin") as UserRole,
    };
  } catch (err) {
    console.error("[admin-topbar identity error]", err);
    return { name: "Admin", role: "admin" as UserRole };
  }
}

export async function AdminTopbar({ title, description }: { title: string; description?: string }) {
  const admin = await getCurrentAdminIdentity();

  return (
    <div className="sticky top-0 z-30 border-b border-ink-200 dark:border-ink-800 bg-[var(--background)]/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 sm:px-8 py-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink-950 dark:text-white">
            {title}
          </h1>
          {description && <p className="mt-0.5 text-sm text-ink-500 dark:text-ink-400">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-fall-500" />
          </button>
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2.5 border-l border-ink-200 dark:border-ink-800 pl-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-100 dark:bg-pulse-950 text-sm font-semibold text-pulse-700 dark:text-pulse-300">
              {admin.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-sm font-medium leading-tight text-ink-900 dark:text-ink-100">
                {admin.name}
              </p>
              <RoleBadge role={admin.role} className="mt-0.5" />
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
