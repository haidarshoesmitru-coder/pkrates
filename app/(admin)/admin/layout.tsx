import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { getDashboardStats } from "@/lib/data/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerList = await headers();
  const isLoginRoute = headerList.get("x-pathname") === "/admin/login";

  // The login screen renders standalone (no sidebar/topbar, no
  // authenticated-only dashboard-stats fetch) — middleware.ts already
  // guarantees an unauthenticated visitor can only ever land here.
  if (isLoginRoute) {
    return <>{children}</>;
  }

  let pendingCounts: Record<string, number> = {};
  try {
    const stats = await getDashboardStats();
    pendingCounts = stats.pendingByDomain;
  } catch {
    // Sidebar renders with zero badges rather than blocking the
    // whole admin shell on a stats query failure.
  }

  return (
    <div className="flex min-h-screen bg-[var(--surface-muted)]">
      <AdminSidebar pendingCounts={pendingCounts} />
      <div className="flex-1 min-w-0">
        <AdminMobileNav />
        {children}
      </div>
    </div>
  );
}
