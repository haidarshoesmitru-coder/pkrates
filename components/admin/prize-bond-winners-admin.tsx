"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trophy, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/admin/status-pill";
import {
  submitPrizeBondWinnersAction,
  approveWinnerSubmissionAction,
  rejectWinnerSubmissionAction,
} from "@/lib/data/admin-actions";
import type { PendingWinnerSubmission, PrizeBondDrawOption } from "@/lib/data/admin";

/**
 * Winners entry for Prize Bonds — the second prize-bond flow.
 * Bond numbers are entered per published draw and per prize tier
 * (one number per line), stored as a single JSON batch in
 * prize_bond_winner_submissions, and only become public
 * prize_bond_winners rows after approval (DB trigger promotes
 * them). Nothing entered here publishes directly.
 */
export function PrizeBondWinnersAdmin({
  draws,
  pendingWinners,
  sources,
}: {
  draws: PrizeBondDrawOption[];
  pendingWinners: PendingWinnerSubmission[];
  sources: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [drawId, setDrawId] = React.useState(draws[0]?.id ?? "");
  const [prizeTier, setPrizeTier] = React.useState("1");
  const [prizeAmount, setPrizeAmount] = React.useState("");
  const [bondNumbers, setBondNumbers] = React.useState("");
  const [sourceId, setSourceId] = React.useState(sources[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const selectClass =
    "h-10 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-500/60";
  const labelClass = "block text-xs font-medium text-ink-500 dark:text-ink-400 mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setIsSubmitting(true);
    try {
      const result = await submitPrizeBondWinnersAction(drawId, Number(prizeTier), prizeAmount, bondNumbers, sourceId);
      if (result?.error) { setActionError(result.error); return; }
      setBondNumbers("");
      setPrizeAmount("");
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to submit winners — please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReview(id: string, approve: boolean) {
    setActionError(null);
    setBusyId(id);
    try {
      const result = approve
        ? await approveWinnerSubmissionAction(id)
        : await rejectWinnerSubmissionAction(id, "Rejected via admin panel");
      if (result?.error) { setActionError(result.error); return; }
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Review failed — please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="px-5 sm:px-8 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-pulse-100 dark:bg-pulse-950 text-pulse-600 dark:text-pulse-400">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink-950 dark:text-white">Draw Winners</h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            Winning bond numbers per draw and prize tier — reviewed before publishing.
          </p>
        </div>
      </div>

      {actionError && (
        <Card className="p-4 border-fall-500/40 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-fall-500 shrink-0 mt-0.5" />
            <p className="text-sm text-fall-700 dark:text-red-300">{actionError}</p>
          </div>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        {draws.length === 0 ? (
          <p className="text-sm text-ink-400">
            No published draws yet — submit and approve a draw above first, then enter its winners here.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Draw</label>
              <select required value={drawId} onChange={(e) => setDrawId(e.target.value)} className={selectClass}>
                {draws.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Prize Tier</label>
              <select required value={prizeTier} onChange={(e) => setPrizeTier(e.target.value)} className={selectClass}>
                <option value="1">1st Prize</option>
                <option value="2">2nd Prize</option>
                <option value="3">3rd Prize</option>
                <option value="4">4th Prize</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Prize Amount (PKR, optional)</label>
              <input
                type="text"
                inputMode="decimal"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                placeholder="e.g. 15000000"
                className={`${selectClass} font-rate`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Winning Bond Numbers (one per line)</label>
              <textarea
                required
                value={bondNumbers}
                onChange={(e) => setBondNumbers(e.target.value)}
                rows={5}
                placeholder={"123456\n234567\n345678"}
                className="w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-[var(--surface)] px-3 py-2 text-sm font-rate focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
              />
            </div>
            <div>
              <label className={labelClass}>Source <span className="text-fall-500">*</span></label>
              <select required value={sourceId} onChange={(e) => setSourceId(e.target.value)} className={selectClass}>
                {sources.length === 0 && <option value="">No sources configured for this domain</option>}
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end">
              <Button type="submit" disabled={isSubmitting || sources.length === 0}>
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Submit Winners for Review
              </Button>
            </div>
          </form>
        )}
      </Card>

      <div className="space-y-4">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
          Pending Winner Batches {pendingWinners.length > 0 && `(${pendingWinners.length})`}
        </h3>
        {pendingWinners.length === 0 && (
          <p className="text-sm text-ink-400">No winner batches awaiting review.</p>
        )}
        {pendingWinners.map((batch) => (
          <Card key={batch.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={batch.status} />
                  <span className="text-xs text-ink-400">{batch.submittedAt}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink-900 dark:text-ink-100">{batch.drawLabel}</p>
                <p className="mt-1 text-xs text-ink-400">
                  {batch.winnersCount} bond number{batch.winnersCount === 1 ? "" : "s"} · Source: {batch.sourceName}
                </p>
                <p className="mt-2 font-rate text-xs text-ink-600 dark:text-ink-300 break-all">
                  {batch.bondNumbers.slice(0, 20).join(", ")}
                  {batch.bondNumbers.length > 20 && ` …and ${batch.bondNumbers.length - 20} more`}
                </p>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button size="sm" onClick={() => handleReview(batch.id, true)} disabled={busyId === batch.id}>
                  {busyId === batch.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReview(batch.id, false)}
                  disabled={busyId === batch.id}
                  className="border-fall-500/40 text-fall-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
