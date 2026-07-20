"use client";

import * as React from "react";
import {
  Coins,
  Banknote,
  Fuel,
  Ticket,
  Package,
  Layers,
  type LucideIcon,
  Plus,
  Check,
  X,
  ShieldAlert,
  FileCheck2,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusPill } from "@/components/admin/status-pill";
import { cn } from "@/lib/utils";
import {
  domainConfigs,
  publishedRecords as initialPublished,
  pendingSubmissions as initialPending,
  dataSources,
  auditLog,
  currentAdminUser,
} from "@/lib/admin-mock-data";
import type { FieldValue, PublishedRecord, Submission } from "@/types/admin";

const iconMap: Record<string, LucideIcon> = {
  coins: Coins,
  banknote: Banknote,
  fuel: Fuel,
  ticket: Ticket,
  package: Package,
  layers: Layers,
};

interface LocalHistoryEntry {
  id: string;
  summary: string;
  action: "insert" | "approve" | "reject";
  by: string;
  at: string;
  notes?: string;
}

function fieldSummary(fields: FieldValue[]) {
  return fields.map((f) => f.value).join(" · ");
}

export function RateDomainAdmin({ domain }: { domain: string }) {
  const config = domainConfigs[domain];
  const Icon = iconMap[config.icon] ?? Coins;
  const domainSources = dataSources.filter((s) => s.domains.includes(domain));
  const domainAuditHistory = auditLog.filter((a) => a.domain === domain);

  const [published, setPublished] = React.useState<PublishedRecord[]>(initialPublished[domain] ?? []);
  const [pending, setPending] = React.useState<Submission[]>(initialPending[domain] ?? []);
  const [localHistory, setLocalHistory] = React.useState<LocalHistoryEntry[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [formValues, setFormValues] = React.useState<Record<string, string>>({});
  const [formSource, setFormSource] = React.useState(domainSources[0]?.name ?? "");
  const [reviewNotes, setReviewNotes] = React.useState<Record<string, string>>({});

  function handleFieldChange(key: string, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault();
    const fields: FieldValue[] = config.fields.map((f) => ({
      key: f.key,
      value: formValues[f.key] ?? "",
    }));
    const newSubmission: Submission = {
      id: `sub-new-${Date.now()}`,
      fields,
      sourceName: formSource,
      submittedBy: currentAdminUser.name,
      submittedAt: "Just now",
      status: "pending",
    };
    setPending((prev) => [newSubmission, ...prev]);
    setLocalHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        summary: `${fieldSummary(fields)} submitted for review`,
        action: "insert",
        by: currentAdminUser.name,
        at: "Just now",
      },
      ...prev,
    ]);
    setFormValues({});
    setShowForm(false);
  }

  function handleApprove(sub: Submission) {
    const newRecord: PublishedRecord = {
      id: `pub-${sub.id}`,
      fields: sub.fields,
      status: "published",
      sourceName: sub.sourceName,
      approvedBy: currentAdminUser.name,
      effectiveAt: "Just now",
    };
    setPublished((prev) => [newRecord, ...prev]);
    setPending((prev) => prev.filter((p) => p.id !== sub.id));
    setLocalHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        summary: `${fieldSummary(sub.fields)} approved`,
        action: "approve",
        by: currentAdminUser.name,
        at: "Just now",
      },
      ...prev,
    ]);
  }

  function handleReject(sub: Submission) {
    setPending((prev) => prev.filter((p) => p.id !== sub.id));
    setLocalHistory((prev) => [
      {
        id: `h-${Date.now()}`,
        summary: `${fieldSummary(sub.fields)} rejected`,
        action: "reject",
        by: currentAdminUser.name,
        at: "Just now",
        notes: reviewNotes[sub.id],
      },
      ...prev,
    ]);
  }

  return (
    <div className="p-5 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pulse-100 dark:bg-pulse-950 text-pulse-600 dark:text-pulse-400">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-950 dark:text-white">
              {config.title}
            </h2>
            <p className="text-sm text-ink-500 dark:text-ink-400">{config.description}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          New Submission
        </Button>
      </div>

      {/* Submit form */}
      {showForm && (
        <Card className="p-5 sm:p-6 border-pulse-200 dark:border-pulse-800">
          <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
            Submit a new rate entry
          </h3>
          <p className="mt-1 text-xs text-ink-400">
            Every submission requires a source citation and enters the pending-review queue —
            nothing publishes directly.
          </p>
          <form onSubmit={handleSubmitNew} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">
                  {field.label} {field.suffix && <span className="text-ink-300">({field.suffix})</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    required
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="h-10 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
                  >
                    <option value="" disabled>Select {field.label.toLowerCase()}</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type={field.type === "number" ? "text" : field.type}
                    inputMode={field.type === "number" ? "decimal" : undefined}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.type === "number" ? "e.g. 285,500" : undefined}
                    className="h-10 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 text-sm font-rate focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5">
                Source <span className="text-fall-500">*</span>
              </label>
              <select
                required
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="h-10 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
              >
                {domainSources.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Submit for Review
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">Published Rates</TabsTrigger>
          <TabsTrigger value="review">
            Pending Review {pending.length > 0 && `(${pending.length})`}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Published */}
        <TabsContent value="published">
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-left text-xs uppercase tracking-wide text-ink-400">
                  {config.fields.map((f) => (
                    <th key={f.key} className="px-5 py-3 font-medium">{f.label}</th>
                  ))}
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Approved By</th>
                  <th className="px-5 py-3 font-medium">Effective</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200 dark:divide-ink-800">
                {published.map((rec) => (
                  <tr key={rec.id} className="hover:bg-ink-50 dark:hover:bg-ink-900/60 transition-colors">
                    {rec.fields.map((f) => (
                      <td key={f.key} className="px-5 py-4 font-rate text-ink-900 dark:text-ink-100">
                        {f.value}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-ink-500 dark:text-ink-400 text-xs">{rec.sourceName}</td>
                    <td className="px-5 py-4 text-ink-500 dark:text-ink-400 text-xs">{rec.approvedBy}</td>
                    <td className="px-5 py-4 text-ink-400 text-xs">{rec.effectiveAt}</td>
                    <td className="px-5 py-4"><StatusPill status={rec.status} /></td>
                  </tr>
                ))}
                {published.length === 0 && (
                  <tr>
                    <td colSpan={config.fields.length + 4} className="px-5 py-10 text-center text-sm text-ink-400">
                      No published rates yet in this domain.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        {/* Review queue */}
        <TabsContent value="review">
          <div className="space-y-4">
            {pending.length === 0 && (
              <Card className="p-10 text-center">
                <FileCheck2 className="h-6 w-6 mx-auto text-pulse-500" />
                <p className="mt-3 text-sm text-ink-500 dark:text-ink-400">
                  Nothing pending — all caught up in this domain.
                </p>
              </Card>
            )}
            {pending.map((sub) => {
              const isOwnSubmission = sub.submittedBy === currentAdminUser.name;
              return (
                <Card key={sub.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={sub.status} />
                        <span className="text-xs text-ink-400">
                          Submitted by <strong className="text-ink-600 dark:text-ink-300 font-medium">{sub.submittedBy}</strong> &middot; {sub.submittedAt}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
                        {sub.fields.map((f) => (
                          <div key={f.key}>
                            <span className="text-[11px] text-ink-400 block">{f.key}</span>
                            <span className="font-rate text-sm font-semibold text-ink-900 dark:text-ink-100">{f.value}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2.5 text-xs text-ink-400">Source: {sub.sourceName}</p>

                      {sub.deviationNote && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5">
                          <ShieldAlert className="h-4 w-4 text-fall-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-fall-700 dark:text-red-300">{sub.deviationNote}</p>
                        </div>
                      )}

                      <textarea
                        placeholder="Reviewer notes (required if rejecting)…"
                        value={reviewNotes[sub.id] ?? ""}
                        onChange={(e) => setReviewNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                        rows={2}
                        className="mt-3 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
                      />
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(sub)}
                        disabled={isOwnSubmission}
                        className="flex-1 sm:flex-none"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(sub)}
                        className="flex-1 sm:flex-none border-fall-500/40 text-fall-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  {isOwnSubmission && (
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
                      <ShieldAlert className="h-3 w-3" />
                      You submitted this entry — another reviewer must approve it (segregation of duties).
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card className="divide-y divide-ink-200 dark:divide-ink-800">
            {[...localHistory, ...domainAuditHistory.map((a) => ({
              id: a.id,
              summary: a.summary,
              action: a.action as "insert" | "approve" | "reject",
              by: a.performedBy,
              at: a.performedAt,
              notes: a.notes,
            }))].map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-5 py-4">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5",
                    entry.action === "approve" && "bg-pulse-50 dark:bg-pulse-950/50 text-rise-600 dark:text-pulse-300",
                    entry.action === "reject" && "bg-red-50 dark:bg-red-950/40 text-fall-600 dark:text-red-300",
                    entry.action === "insert" && "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400"
                  )}
                >
                  {entry.action === "approve" && <Check className="h-3.5 w-3.5" />}
                  {entry.action === "reject" && <X className="h-3.5 w-3.5" />}
                  {entry.action === "insert" && <Clock className="h-3.5 w-3.5" />}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-ink-800 dark:text-ink-200">{entry.summary}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {entry.by} &middot; {entry.at}
                  </p>
                  {entry.notes && (
                    <p className="mt-1 text-xs italic text-ink-500 dark:text-ink-400">&ldquo;{entry.notes}&rdquo;</p>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-400">Sources feeding this domain:</span>
        {domainSources.map((s) => (
          <Badge key={s.id} variant="outline">{s.name}</Badge>
        ))}
      </div>
    </div>
  );
}
