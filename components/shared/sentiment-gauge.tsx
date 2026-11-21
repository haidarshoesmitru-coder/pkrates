"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function labelForScore(score: number) {
  if (score >= 70) return "Bullish";
  if (score >= 55) return "Leaning Bullish";
  if (score >= 45) return "Neutral";
  if (score >= 30) return "Leaning Bearish";
  return "Bearish";
}

export function SentimentGauge({ score, className }: { score: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, score));
  const angle = (clamped / 100) * 180; // 0-180 degrees across the semicircle
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const needleRad = ((180 - angle) * Math.PI) / 180;
  const needleX = cx - radius * 0.82 * Math.cos(needleRad);
  const needleY = cy - radius * 0.82 * Math.sin(needleRad);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 200 110" className="w-56">
        <defs>
          <linearGradient id="sentiment-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c1443d" />
            <stop offset="50%" stopColor="#c89b3c" />
            <stop offset="100%" stopColor="#17966c" />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#sentiment-gradient)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <motion.line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          className="text-ink-900 dark:text-white"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
        <circle cx={cx} cy={cy} r={5} className="fill-ink-900 dark:fill-white" />
      </svg>
      <p className="-mt-2 font-rate text-3xl font-semibold text-ink-950 dark:text-white">
        {clamped}
      </p>
      <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{labelForScore(clamped)}</p>
    </div>
  );
}
