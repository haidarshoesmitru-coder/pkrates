"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareButton({
  title,
  text,
  className,
}: {
  title: string;
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `${title} — PKRates`,
      text,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled — fall through silently
        return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} — ${shareData.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label={`Share ${title}`}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-pulse-600 dark:hover:text-pulse-400 transition-colors",
        className
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-pulse-500" /> : <Share2 className="h-3.5 w-3.5" />}
    </button>
  );
}
