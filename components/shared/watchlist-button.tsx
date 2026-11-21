"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pkrates:watchlist";

function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeWatchlist(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("pkrates:watchlist-change"));
}

export function WatchlistButton({ id, className }: { id: string; className?: string }) {
  const [isWatched, setIsWatched] = React.useState(false);

  React.useEffect(() => {
    setIsWatched(readWatchlist().includes(id));
    const sync = () => setIsWatched(readWatchlist().includes(id));
    window.addEventListener("pkrates:watchlist-change", sync);
    return () => window.removeEventListener("pkrates:watchlist-change", sync);
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current = readWatchlist();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    writeWatchlist(next);
    setIsWatched(next.includes(id));
  }

  return (
    <button
      onClick={toggle}
      aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={isWatched}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        isWatched
          ? "text-gold-500"
          : "text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-gold-500",
        className
      )}
    >
      <Star className={cn("h-3.5 w-3.5 transition-transform", isWatched && "fill-gold-500 scale-110")} />
    </button>
  );
}

/** Hook exposing watchlist count, used for the navbar badge. */
export function useWatchlistCount() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const sync = () => setCount(readWatchlist().length);
    sync();
    window.addEventListener("pkrates:watchlist-change", sync);
    return () => window.removeEventListener("pkrates:watchlist-change", sync);
  }, []);

  return count;
}
