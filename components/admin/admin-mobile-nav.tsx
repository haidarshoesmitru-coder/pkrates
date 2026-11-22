"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Coins,
  Banknote,
  Fuel,
  Ticket,
  Package,
  Layers,
  Building2,
  ScrollText,
  History,
  Users,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/gold", label: "Gold", icon: Coins },
  { href: "/admin/currency", label: "Currency", icon: Banknote },
  { href: "/admin/petrol", label: "Petrol", icon: Fuel },
  { href: "/admin/prize-bonds", label: "Prize Bonds", icon: Ticket },
  { href: "/admin/cement", label: "Cement", icon: Package },
  { href: "/admin/steel", label: "Steel", icon: Layers },
  { href: "/admin/sources", label: "Sources", icon: Building2 },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/history", label: "History", icon: History },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/posts", label: "News & Blog", icon: Newspaper },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <div className="lg:hidden border-b border-ink-200 dark:border-ink-800 bg-[var(--surface)] overflow-x-auto">
      <div className="flex gap-1 px-3 py-2 min-w-max">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-pulse-600 text-white"
                  : "text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
