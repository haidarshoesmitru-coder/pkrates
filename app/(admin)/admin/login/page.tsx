"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError("Incorrect email or password.");
      return;
    }

    const next = searchParams.get("next") ?? "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-muted)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-ink-200 dark:border-ink-800 bg-[var(--background)] p-8 shadow-sm">
        <h1 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
          PKRates Admin
        </h1>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          Sign in to manage rates.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-700 dark:text-ink-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 dark:border-ink-800 bg-[var(--background)] px-3 py-2 text-sm text-ink-950 dark:text-white outline-none focus:ring-2 focus:ring-pulse-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-700 dark:text-ink-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink-200 dark:border-ink-800 bg-[var(--background)] px-3 py-2 text-sm text-ink-950 dark:text-white outline-none focus:ring-2 focus:ring-pulse-500"
            />
          </div>

          {error && <p className="text-sm text-fall-600 dark:text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-pulse-600 px-4 py-2 text-sm font-medium text-white hover:bg-pulse-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
