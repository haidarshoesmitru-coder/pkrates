import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a number as PKR currency without decimals, e.g. 285,500 */
export function formatPKR(value: number, options?: { decimals?: number }) {
  return new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: options?.decimals ?? 0,
    maximumFractionDigits: options?.decimals ?? 0,
  }).format(value);
}

/** Formats a signed percentage change, e.g. +1.24% / -0.38% */
export function formatDelta(percent: number) {
  const sign = percent > 0 ? "+" : percent < 0 ? "" : "±";
  return `${sign}${percent.toFixed(2)}%`;
}
