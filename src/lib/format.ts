import { siteConfig } from "@/constants/config";

/** Format integer cents as USD (no decimals by default for daily budgets). */
export function formatMoney(
  cents: number,
  opts?: { maximumFractionDigits?: number },
): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: opts?.maximumFractionDigits ?? 0,
  }).format(cents / 100);
}

export function formatDistance(km: number): string {
  return `${km} km away`;
}

/** Title-case a region/category for display. */
export function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
