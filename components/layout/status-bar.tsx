import { PulseDot } from "@/components/shared/pulse-dot";

export function StatusBar() {
  return (
    <div className="hidden sm:block bg-ink-950 text-ink-300 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PulseDot />
          <span>All sources live &middot; last verified 4 minutes ago</span>
        </div>
        <span className="text-ink-500">Trusted by 50,000+ Pakistanis daily</span>
      </div>
    </div>
  );
}
