"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleBadge } from "@/components/admin/role-badge";
import { currentAdminUser } from "@/lib/admin-mock-data";

export function AdminTopbar({ title, description }: { title: string; description?: string }) {
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
              {currentAdminUser.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-sm font-medium leading-tight text-ink-900 dark:text-ink-100">
                {currentAdminUser.name}
              </p>
              <RoleBadge role={currentAdminUser.role} className="mt-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
