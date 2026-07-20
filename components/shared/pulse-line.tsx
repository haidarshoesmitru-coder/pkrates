"use client";

import { motion } from "framer-motion";

/**
 * The site's signature motif: a single trace that behaves like a heartbeat
 * monitor reading the market rather than a decorative squiggle — flat,
 * then a sharp spike through a data point, echoing "Financial Pulse".
 */
export function PulseLine({ className }: { className?: string }) {
  const path =
    "M0 60 H120 L145 60 L160 20 L178 100 L196 60 L215 60 H420 L440 60 L458 30 L476 90 L494 60 L512 60 H900";

  return (
    <svg
      viewBox="0 0 900 120"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d={path}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
      />
      <motion.circle
        cx={178}
        cy={100}
        r={4}
        fill="currentColor"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.3 }}
      />
      <motion.circle
        cx={476}
        cy={90}
        r={4}
        fill="currentColor"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 2.5 }}
      />
    </svg>
  );
}
