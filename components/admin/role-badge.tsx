import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/admin";

const roleMap: Record<UserRole, { label: string; className: string }> = {
  super_admin: { label: "Super Admin", className: "bg-ink-900 text-white dark:bg-white dark:text-ink-900" },
  admin: { label: "Admin", className: "bg-pulse-600 text-white" },
  reviewer: { label: "Reviewer", className: "bg-pulse-50 text-pulse-700 dark:bg-pulse-950 dark:text-pulse-300" },
  editor: { label: "Editor", className: "bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300" },
  analyst: { label: "Analyst", className: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300" },
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  const r = roleMap[role];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", r.className, className)}>
      {r.label}
    </span>
  );
}
