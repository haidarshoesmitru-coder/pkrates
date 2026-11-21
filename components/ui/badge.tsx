import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-pulse-100 text-pulse-700 dark:bg-pulse-950 dark:text-pulse-300",
        gold: "border-transparent bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-200",
        rise: "border-transparent bg-pulse-50 text-rise-600 dark:bg-pulse-950/60 dark:text-pulse-300",
        fall: "border-transparent bg-red-50 text-fall-600 dark:bg-red-950/40 dark:text-red-300",
        outline: "border-ink-300 dark:border-ink-700 text-ink-600 dark:text-ink-300",
        muted: "border-transparent bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
