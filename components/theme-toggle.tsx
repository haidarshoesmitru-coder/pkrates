"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

/**
 * Three-way Light/Dark/System control, replacing the previous
 * two-state light<->dark cycle button. `next-themes` already
 * persists whatever `setTheme()` is called with to localStorage —
 * "system" is a real, storable value like any other, so choosing
 * it is itself the "follow the OS" choice, and choosing Light or
 * Dark explicitly overrides it and stays persisted across visits
 * without any extra code here.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-10" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Change theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative overflow-hidden"
      >
        {theme === "system" ? (
          <Monitor className="h-[18px] w-[18px]" />
        ) : (
          <>
            <Sun className={cn("h-[18px] w-[18px] transition-all duration-300", isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0")} />
            <Moon className={cn("absolute h-[18px] w-[18px] transition-all duration-300", isDark ? "scale-100 rotate-0" : "scale-0 rotate-90")} />
          </>
        )}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-36 rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-1 shadow-xl z-50"
        >
          {OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const isSelected = theme === option.value;
            return (
              <button
                key={option.value}
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <OptionIcon className="h-3.5 w-3.5" />
                  {option.label}
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-pulse-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
