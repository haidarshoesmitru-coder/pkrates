"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PulseLine } from "@/components/shared/pulse-line";

export function NewsletterSection() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl border border-ink-200 dark:border-ink-800 bg-gradient-to-br from-pulse-600 to-pulse-800 px-6 py-14 sm:px-16 sm:py-16 text-white">
        <div className="absolute inset-x-0 bottom-0 text-white/10">
          <PulseLine className="h-24 w-full" />
        </div>

        <div className="relative mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Mail className="h-3.5 w-3.5" />
            Free daily digest
          </span>
          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Get today&rsquo;s biggest rate moves in your inbox
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-pulse-50/85">
            One email every morning: gold, currency, petrol and the categories
            that moved the most — nothing else.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-7 flex items-center justify-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-medium"
            >
              <CheckCircle2 className="h-4 w-4" />
              You&rsquo;re subscribed — check your inbox to confirm.
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-white text-pulse-700 hover:bg-pulse-50"
              >
                Subscribe
              </Button>
            </form>
          )}
          <p className="mt-4 text-xs text-pulse-50/60">
            No spam. Unsubscribe anytime. Read our{" "}
            <a href="/privacy" className="underline underline-offset-2">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
