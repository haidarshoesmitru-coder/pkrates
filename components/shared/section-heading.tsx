import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span className="font-rate text-xs uppercase tracking-[0.18em] text-pulse-600 dark:text-pulse-400">
        {eyebrow}
      </span>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-[15px] leading-relaxed text-ink-500 dark:text-ink-400">
          {description}
        </p>
      )}
    </div>
  );
}
