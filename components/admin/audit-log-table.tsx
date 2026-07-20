"use client";

import * as React from "react";
import { Search, Lock, Check, X, FileEdit, Clock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { auditLog, domainConfigs } from "@/lib/admin-mock-data";

const actionMeta = {
  insert: { icon: Clock, className: "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400", label: "Submitted" },
  approve: { icon: Check, className: "bg-pulse-50 dark:bg-pulse-950/50 text-rise-600 dark:text-pulse-300", label: "Approved" },
  reject: { icon: X, className: "bg-red-50 dark:bg-red-950/40 text-fall-600 dark:text-red-300", label: "Rejected" },
  correct: { icon: FileEdit, className: "bg-gold-50 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300", label: "Corrected" },
  update: { icon: RefreshCw, className: "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400", label: "Updated" },
};

export function AuditLogTable() {
  const [query, setQuery] = React.useState("");
  const [domainFilter, setDomainFilter] = React.useState("all");
  const [actionFilter, setActionFilter] = React.useState("all");

  const filtered = auditLog.filter((entry) => {
    const matchesQuery =
      entry.summary.toLowerCase().includes(query.toLowerCase()) ||
      entry.performedBy.toLowerCase().includes(query.toLowerCase());
    const matchesDomain = domainFilter === "all" || entry.domain === domainFilter;
    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    return matchesQuery && matchesDomain && matchesAction;
  });

  return (
    <div className="p-5 sm:p-8 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by summary or user…"
            className="h-10 w-full rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
          />
        </div>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="h-10 rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-4 text-sm focus:outline-none"
        >
          <option value="all">All domains</option>
          {Object.values(domainConfigs).map((d) => (
            <option key={d.slug} value={d.slug}>{d.title.replace(" Management", "")}</option>
          ))}
          <option value="system">System</option>
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-4 text-sm focus:outline-none"
        >
          <option value="all">All actions</option>
          <option value="insert">Submitted</option>
          <option value="approve">Approved</option>
          <option value="reject">Rejected</option>
          <option value="correct">Corrected</option>
          <option value="update">Updated</option>
        </select>
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-400">
        <Lock className="h-3 w-3" />
        This log is append-only — entries cannot be edited or deleted by any role, including Super Admin.
      </div>

      <Card className="divide-y divide-ink-200 dark:divide-ink-800">
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-ink-400">No matching entries.</p>
        )}
        {filtered.map((entry) => {
          const meta = actionMeta[entry.action];
          const Icon = meta.icon;
          return (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4">
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full shrink-0", meta.className)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">{entry.domain.replace("-", " ")}</Badge>
                  <span className="text-xs text-ink-400">{meta.label}</span>
                </div>
                <p className="mt-1.5 text-sm text-ink-800 dark:text-ink-200">{entry.summary}</p>
                {(entry.oldValue || entry.newValue) && (
                  <p className="mt-1 font-rate text-xs text-ink-500 dark:text-ink-400">
                    {entry.oldValue && <span className="line-through decoration-fall-500/60">{entry.oldValue}</span>}
                    {entry.oldValue && entry.newValue && " → "}
                    {entry.newValue && <span className="text-ink-700 dark:text-ink-200">{entry.newValue}</span>}
                  </p>
                )}
                {entry.notes && (
                  <p className="mt-1 text-xs italic text-ink-400">&ldquo;{entry.notes}&rdquo;</p>
                )}
                <p className="mt-1.5 text-xs text-ink-400">
                  {entry.performedBy} &middot; {entry.performedAt} &middot;{" "}
                  <span className="font-rate">{entry.entityTable}</span>
                </p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
