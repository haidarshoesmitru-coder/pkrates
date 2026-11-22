"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PulseLine } from "@/components/shared/pulse-line";

export function NewsletterSection() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not subscribe right now — please try again later.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Could not subscribe right now — please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="newsletter" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-20">
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
              You&rsquo;re subscribed — your first digest arrives tomorrow morning.
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
                disabled={isSubmitting}
                className="bg-white text-pulse-700 hover:bg-pulse-50"
              >
                {isSubmitting ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          )}
          {error && (
            <p className="mt-4 text-sm font-medium text-white bg-white/15 rounded-full px-4 py-2 inline-block">
              {error}
            </p>
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
