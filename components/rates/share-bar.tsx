"use client";

import * as React from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Inline WhatsApp glyph — kept local rather than pulling in a new icon
// dependency for a single brand mark.
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.876.52 3.63 1.42 5.13L2 22l4.995-1.393A9.958 9.958 0 0 0 12.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.2c-1.75 0-3.375-.517-4.739-1.406l-.34-.213-3.34.93.936-3.253-.222-.34A8.176 8.176 0 0 1 3.8 12c0-4.522 3.679-8.2 8.201-8.2 4.521 0 8.199 3.678 8.199 8.2 0 4.522-3.678 8.2-8.199 8.2z" />
    </svg>
  );
}

export function ShareBar({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = React.useState(false);

  function shareUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function handleWhatsApp() {
    const message = encodeURIComponent(`${text} — ${shareUrl()}`);
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function handleWebShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${title} — PKRates`, text, url: shareUrl() });
      } catch {
        // user cancelled — no-op
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1.5">
        <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5 text-pulse-500" /> : <Link2 className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy Link"}</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleWebShare} className="gap-1.5">
        <Share2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Share</span>
      </Button>
    </div>
  );
}
