import { ShieldCheck, Clock, FileCheck2, Building2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";


const pillars = [
  {
    icon: FileCheck2,
    title: "Named sources, every time",
    description: "Every published rate carries a visible source citation — never an anonymous number.",
  },
  {
    icon: Clock,
    title: "Timestamped to the minute",
    description: "You always see exactly when a rate last changed, not just that it exists.",
  },
  {
    icon: ShieldCheck,
    title: "Two-person verification",
    description: "No rate goes live without an independent reviewer approving it against the source.",
  },
];

export function TrustSection({ sources }: { sources: { name: string; role: string }[] }) {
  return (
    <section className="border-t border-ink-200 dark:border-ink-800 bg-ink-950 text-ink-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <SectionHeading
          eyebrow="Why Trust PKRates"
          title="Built like market infrastructure, not a blog"
          description="We treat data integrity as the product. Here's exactly how a number goes from source to screen."
          className="[&_h2]:text-white [&_p]:text-ink-400"
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-ink-800 bg-ink-900/60 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pulse-500/15 text-pulse-400">
                <p.icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{p.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-ink-800 bg-ink-900/40 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-ink-300">
            <Building2 className="h-4 w-4" />
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide">
              Our data partners
            </h3>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sources.map((s) => (
              <div key={s.name} className="rounded-xl border border-ink-800 bg-ink-950/60 p-4">
                <p className="text-sm font-medium text-ink-100 leading-snug">{s.name}</p>
                <p className="mt-1 text-xs text-ink-500">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
