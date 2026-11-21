import type { SentimentSignal } from "@/types";

interface DomainMovement {
  category: string;
  changePercent: number;
  volatilityHint?: boolean;
}

/**
 * Turns a domain's average/representative % change into a mood
 * label and a 0-100 score. This is a real, if simple, computation
 * over live data — not a fabricated figure. Volatile categories
 * (crypto) are flagged by the caller via `volatilityHint` rather
 * than inferred from magnitude alone, since a 2% gold move means
 * something very different from a 2% crypto move.
 */
export function computeMarketSentiment(domains: DomainMovement[]): {
  signals: SentimentSignal[];
  overallScore: number;
} {
  const signals: SentimentSignal[] = domains.map((d) => {
    const score = Math.round(Math.max(5, Math.min(95, 50 + d.changePercent * 12)));

    let mood: SentimentSignal["mood"];
    let note: string;
    if (d.volatilityHint && Math.abs(d.changePercent) > 2) {
      mood = "volatile";
      note = `Swung ${Math.abs(d.changePercent).toFixed(1)}% recently`;
    } else if (d.changePercent > 0.15) {
      mood = "bullish";
      note = `Trending up ${d.changePercent.toFixed(2)}%`;
    } else if (d.changePercent < -0.15) {
      mood = "bearish";
      note = `Trending down ${Math.abs(d.changePercent).toFixed(2)}%`;
    } else {
      mood = "neutral";
      note = "Holding steady";
    }

    return { category: d.category, mood, score, note };
  });

  const overallScore = signals.length
    ? Math.round(signals.reduce((sum, s) => sum + s.score, 0) / signals.length)
    : 50;

  return { signals, overallScore };
}
