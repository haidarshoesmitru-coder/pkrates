import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--surface-muted)]">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminMobileNav />
        {children}
      </div>
    </div>
  );
}
