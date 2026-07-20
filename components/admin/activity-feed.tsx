import { Check, X, FileEdit, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { auditLog } from "@/lib/admin-mock-data";

const actionIcon = {
  approve: Check,
  reject: X,
  correct: FileEdit,
  insert: Clock,
  update: FileEdit,
};

export function ActivityFeed() {
  return (
    <Card className="divide-y divide-ink-200 dark:divide-ink-800">
      <div className="px-5 py-4">
        <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-ink-100">
          Recent Activity
        </h3>
      </div>
      {auditLog.slice(0, 6).map((entry) => {
        const Icon = actionIcon[entry.action] ?? Clock;
        return (
          <div key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full shrink-0",
                entry.action === "approve" && "bg-pulse-50 dark:bg-pulse-950/50 text-rise-600 dark:text-pulse-300",
                entry.action === "reject" && "bg-red-50 dark:bg-red-950/40 text-fall-600 dark:text-red-300",
                (entry.action === "insert" || entry.action === "correct" || entry.action === "update") &&
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
