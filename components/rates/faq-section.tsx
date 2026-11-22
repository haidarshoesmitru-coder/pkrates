"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection({ title, items }: { title: string; items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section>
      <SectionHeading eyebrow="FAQs" title={title} />
      <div className="mt-6 space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.question}
              className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-ink-900 dark:text-ink-100">{item.question}</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SEO: FAQPage structured data mirrors the visible Q&A above.
          `<` is escaped as < so FAQ text can never break out
          of the script tag (audit Minor #5). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}
