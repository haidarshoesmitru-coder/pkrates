import { cn } from "@/lib/utils";

export function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-pulse-500 animate-pulse-ring" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse-500" />
    </span>
  );
}
