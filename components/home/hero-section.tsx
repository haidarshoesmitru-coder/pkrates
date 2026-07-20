"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PulseDot } from "@/components/shared/pulse-dot";
import { PulseLine } from "@/components/shared/pulse-line";
import { ShareButton } from "@/components/shared/share-button";
import { WatchlistButton } from "@/components/shared/watchlist-button";
import { lastUpdated } from "@/lib/mock-data";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 dark:border-ink-800">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pulse-100/60 via-transparent to-transparent dark:from-pulse-950/40" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10 sm:pt-20 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-[var(--surface)] px-3.5 py-1.5"
        >
          <PulseDot />
          <span className="font-rate text-xs text-ink-600 dark:text-ink-300">
            Live &middot; Last updated {lastUpdated}
          </span>
        </motion.div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] tracking-tight text-ink-950 dark:text-white"
            >
              Pakistan&rsquo;s financial
              <br />
              pulse, <span className="text-pulse-600 dark:text-pulse-400">read live.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-500 dark:text-ink-400"
            >
              Gold, currency, petrol, crypto, prize bonds, cement and steel &mdash;
              every rate verified against a named source and timestamped the
              moment it changes. No guesswork, no stale boards.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search &ldquo;gold rate Lahore&rdquo;"
                  className="h-12 w-full rounded-full border border-ink-200 dark:border-ink-700 bg-[var(--surface)] pl-11 pr-4 text-sm text-ink-900 dark:text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-pulse-500/60"
                />
              </div>
              <Button size="lg" className="group">
                View All Rates
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink-500 dark:text-ink-400"
            >
              <span>
                <strong className="font-display font-semibold text-ink-900 dark:text-ink-100">7</strong>{" "}
                data categories
              </span>
              <span>
                <strong className="font-display font-semibold text-ink-900 dark:text-ink-100">10+</strong>{" "}
                cities tracked
              </span>
              <span>
                <strong className="font-display font-semibold text-ink-900 dark:text-ink-100">5</strong>{" "}
                verified institutional sources
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <span className="font-rate text-xs uppercase tracking-widest text-ink-400">
                Gold 24K &middot; Karachi
              </span>
              <div className="flex items-center gap-0.5">
                <ShareButton title="Gold 24K — Karachi" text="Gold 24K in Karachi: Rs 285,500 per tola on PKRates" />
                <WatchlistButton id="hero-gold-24k-karachi" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-rate text-4xl font-semibold text-ink-950 dark:text-white">
                Rs 285,500
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-400">per tola &middot; verified 4 min ago</p>
            <div className="mt-5 text-pulse-600 dark:text-pulse-400">
              <PulseLine className="h-16 w-full" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-ink-400">7-day trend</span>
              <span className="font-rate font-medium text-rise-600 dark:text-pulse-400">
                +2.26% this week
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
