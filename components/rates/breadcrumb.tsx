import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-400 overflow-x-auto whitespace-nowrap">
      <Link href="/" className="flex items-center gap-1 hover:text-pulse-600 dark:hover:text-pulse-400 transition-colors shrink-0">
        <Home className="h-3 w-3" />
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 shrink-0">
          <ChevronRight className="h-3 w-3 text-ink-300 dark:text-ink-700" />
          {item.href ? (
            <Link href={item.href} className="hover:text-pulse-600 dark:hover:text-pulse-400 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-600 dark:text-ink-300 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
