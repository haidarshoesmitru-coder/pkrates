"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, ShieldCheck, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/admin/role-badge";
import { cn } from "@/lib/utils";
import { rolePermissions } from "@/lib/domain-config";
import { updateUserRoleAction } from "@/lib/data/admin-actions";
import type { UserRole } from "@/types/admin";

const roleOptions: UserRole[] = ["super_admin", "admin", "reviewer", "editor", "analyst"];

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  domains: string[];
  isActive: boolean;
  lastActive: string;
}

export function UsersRolesManager({ users, loadError }: { users: UserRow[]; loadError?: boolean }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function changeRole(id: string, role: UserRole) {
    setPendingId(id);
    try {
      await updateUserRoleAction(id, role);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (loadError) {
    return (
      <div className="p-5 sm:p-8">
        <Card className="p-10 text-center border-fall-500/40">
          <p className="text-sm text-ink-500 dark:text-ink-400">Couldn&rsquo;t load users. Please refresh the page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500 dark:text-ink-400">{users.length} team members</p>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {users.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-ink-400">No users found.</p>
        </Card>
      ) : (
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Assigned Domains</th>
              <th className="px-5 py-3 font-medium">Last Active</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-100 dark:bg-pulse-950 text-xs font-semibold text-pulse-700 dark:text-pulse-300">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <p className="font-medium text-ink-900 dark:text-ink-100">{user.name}</p>
                      <p className="text-xs text-ink-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      disabled={pendingId === user.id}
                      onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                      className="h-8 rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 text-xs focus:outline-none"
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>{r.replace("_", " ")}</option>
                      ))}
                    </select>
                    {pendingId === user.id && <Loader2 className="h-3 w-3 animate-spin text-ink-400" />}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {user.domains.length === 0 ? (
                      <span className="text-xs text-ink-400">&mdash;</span>
                    ) : (
                      user.domains.map((d) => (
                        <Badge key={d} variant="outline" className="capitalize text-[10px]">
                          {d.replace("_", " ")}
                        </Badge>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-ink-400">{user.lastActive}</td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium",
                      user.isActive ? "text-rise-600 dark:text-pulse-400" : "text-ink-400"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? "bg-pulse-500" : "bg-ink-300")} />
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-pulse-600 dark:text-pulse-400" />
          <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
            Permission Matrix
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(rolePermissions).map(([role, perms]) => (
            <Card key={role} className="p-5">
              <RoleBadge role={role as UserRole} />
              <ul className="mt-3 space-y-1.5">
                {perms.map((perm) => (
                  <li key={perm} className="flex items-start gap-2 text-xs text-ink-600 dark:text-ink-300">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-ink-300 dark:bg-ink-600 shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
