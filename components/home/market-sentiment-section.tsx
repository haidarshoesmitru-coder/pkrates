import { Flame, Snowflake, Minus, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { SentimentGauge } from "@/components/shared/sentiment-gauge";
import type { SentimentSignal } from "@/types";
import { cn } from "@/lib/utils";

const moodStyles: Record<string, { icon: typeof Flame; className: string; label: string }> = {
  bullish: { icon: Flame, className: "text-rise-600 dark:text-pulse-400 bg-pulse-50 dark:bg-pulse-950/50", label: "Bullish" },
  bearish: { icon: Snowflake, className: "text-fall-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40", label: "Bearish" },
  neutral: { icon: Minus, className: "text-ink-500 dark:text-ink-400 bg-ink-100 dark:bg-ink-800", label: "Neutral" },
  volatile: { icon: Zap, className: "text-gold-600 dark:text-gold-400 bg-gold-50 dark:bg-gold-900/30", label: "Volatile" },
};

export function MarketSentimentSection({ signals, overallScore }: { signals: SentimentSignal[]; overallScore: number }) {
  return (
    <section className="border-t border-ink-200 dark:border-ink-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <SectionHeading
          eyebrow="Market Mood"
          title="How the market is feeling right now"
          description="A composite read of momentum, volatility and direction across every category — updated alongside the rates themselves."
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.6fr] gap-6">
          <Card className="flex flex-col items-center justify-center p-8">
            <span className="font-rate text-xs uppercase tracking-widest text-ink-400">
              Overall Market Mood
            </span>
            <SentimentGauge score={overallScore} className="mt-4" />
            <p className="mt-3 max-w-[220px] text-center text-xs text-ink-400">
              Weighted across gold, currency, fuel, crypto and steel movement today
            </p>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {signals.map((signal) => {
              const style = moodStyles[signal.mood];
              const Icon = style.icon;
              return (
                <Card key={signal.category} className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50">
                      {signal.category}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", style.className)}>
                      <Icon className="h-3 w-3" />
                      {style.label}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        signal.mood === "bullish" && "bg-pulse-500",
                        signal.mood === "bearish" && "bg-fall-500",
                        signal.mood === "neutral" && "bg-ink-400",
                        signal.mood === "volatile" && "bg-gold-500"
                      )}
                      style={{ width: `${signal.score}%` }}
                    />
                  </div>
                  <p className="mt-2.5 text-xs text-ink-500 dark:text-ink-400">{signal.note}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
