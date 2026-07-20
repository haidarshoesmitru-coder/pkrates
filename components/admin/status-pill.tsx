import { Clock, CheckCircle2, XCircle, AlertTriangle, FileEdit, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMap = {
  pending: { label: "Pending Review", icon: Clock, className: "bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300" },
  approved: { label: "Approved", icon: CheckCircle2, className: "bg-pulse-50 text-rise-600 dark:bg-pulse-950/50 dark:text-pulse-300" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-red-50 text-fall-600 dark:bg-red-950/40 dark:text-red-300" },
  flagged_anomaly: { label: "Flagged — Anomaly", icon: AlertTriangle, className: "bg-red-50 text-fall-600 dark:bg-red-950/40 dark:text-red-300" },
  published: { label: "Published", icon: CheckCircle2, className: "bg-pulse-50 text-rise-600 dark:bg-pulse-950/50 dark:text-pulse-300" },
  corrected: { label: "Corrected", icon: FileEdit, className: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300" },
  void: { label: "Void", icon: Ban, className: "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400" },
} as const;

export function StatusPill({ status, className }: { status: keyof typeof statusMap; className?: string }) {
  const s = statusMap[status];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.className, className)}>
      <Icon className="h-3 w-3" />
      {s.label}
    </span>
  );
}
