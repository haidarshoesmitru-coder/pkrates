import { Check, X, FileEdit, Clock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ActivityEntry {
  id: string;
  summary: string;
  action: "approve" | "reject" | "correct" | "insert" | "update" | "verify" | "auto_publish" | "deactivate";
  performedBy: string;
  performedAt: string;
}

const actionIcon = {
  approve: Check, reject: X, correct: FileEdit, insert: Clock,
  update: FileEdit, verify: FileEdit, auto_publish: Check, deactivate: X,
};

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card className="divide-y divide-ink-200 dark:divide-ink-800">
      <div className="px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
          Recent Activity
        </h3>
      </div>
      {entries.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-ink-400">No recent activity yet.</p>
      )}
      {entries.slice(0, 6).map((entry) => {
        const Icon = actionIcon[entry.action] ?? RefreshCw;
        return (
          <div key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full shrink-0",
                (entry.action === "approve" || entry.action === "auto_publish") && "bg-pulse-50 dark:bg-pulse-950/50 text-rise-600 dark:text-pulse-300",
                (entry.action === "reject" || entry.action === "deactivate") && "bg-red-50 dark:bg-red-950/40 text-fall-600 dark:text-red-300",
                (entry.action === "insert" || entry.action === "correct" || entry.action === "update" || entry.action === "verify") &&
                  "bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink-800 dark:text-ink-200 truncate">{entry.summary}</p>
              <p className="mt-0.5 text-xs text-ink-400">
                {entry.performedBy} &middot; {entry.performedAt}
              </p>
            </div>
          </div>
        );
      })}
    </Card>
  );
}
