"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  Gem,
  Banknote,
  Fuel,
  Ticket,
  Package,
  Layers,
  Building2,
  ScrollText,
  History,
  Users,
  Activity,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  domain?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Rate Management",
    items: [
      { href: "/admin/gold", label: "Gold", icon: Coins, domain: "gold" },
      { href: "/admin/silver", label: "Silver", icon: Gem, domain: "silver" },
      { href: "/admin/currency", label: "Currency", icon: Banknote, domain: "currency" },
      { href: "/admin/petrol", label: "Petrol", icon: Fuel, domain: "petrol" },
      { href: "/admin/prize-bonds", label: "Prize Bonds", icon: Ticket, domain: "prize-bonds" },
      { href: "/admin/cement", label: "Cement", icon: Package, domain: "cement" },
      { href: "/admin/steel", label: "Steel / Saria", icon: Layers, domain: "steel" },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/admin/sources", label: "Data Sources", icon: Building2 },
      { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
      { href: "/admin/history", label: "Update History", icon: History },
      { href: "/admin/users", label: "Users & Roles", icon: Users },
    ],
  },
];

export function AdminSidebar({ pendingCounts }: { pendingCounts: Record<string, number> }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-200 dark:border-ink-800 bg-[var(--surface)] h-screen sticky top-0">
      <div className="flex h-16 items-center gap-2 border-b border-ink-200 dark:border-ink-800 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-600 text-white">
          <Activity className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="font-display text-base font-semibold tracking-tight">
          PK<span className="text-pulse-600 dark:text-pulse-400">Rates</span>
          <span className="ml-1.5 rounded-md bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 text-[10px] font-medium text-ink-500 dark:text-ink-400 align-middle">
            ADMIN
          </span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-ink-400">
              {section.label}
            </p>
            <div className="mt-2 space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const pendingCount = item.domain ? pendingCounts[item.domain] ?? 0 : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-pulse-600 text-white"
                        : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {pendingCount > 0 && (
                      <span
                        className={cn(
                          "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                          active ? "bg-white/20 text-white" : "bg-gold-500 text-ink-950"
                        )}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-200 dark:border-ink-800 p-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to public site
        </Link>
      </div>
    </aside>
  );
}
