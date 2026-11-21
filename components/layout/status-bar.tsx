import Link from "next/link";

export function StatusBar() {
  return (
    <div className="hidden sm:block bg-ink-950 text-ink-300 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <span>Every rate shows its named source and last-updated time</span>
        <Link href="/sources" className="text-ink-400 hover:text-white transition-colors">
          Sources &amp; methodology
        </Link>
      </div>
    </div>
  );
}
