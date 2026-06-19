import { expect, type Page } from "@playwright/test";

// Authenticated specs need a confirmed Supabase user. Provide credentials via env so the
// suite stays green (auto-skips) until a live instance + a confirmed seed user exist:
//   E2E_EMAIL=...  E2E_PASSWORD=...  (a pre-confirmed user; see the runbook)
// The app itself must also be pointed at Supabase via .env.local.
// See ProjectDocs/PHASE3_GATE_VERIFICATION.md.
export const E2E_EMAIL = process.env.E2E_EMAIL ?? "";
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "";
export const authConfigured = Boolean(E2E_EMAIL && E2E_PASSWORD);

export const SKIP_REASON =
  "Set E2E_EMAIL + E2E_PASSWORD (a confirmed Supabase user) and configure .env.local — see ProjectDocs/PHASE3_GATE_VERIFICATION.md";

// Unique suffix so parallel runs / re-runs don't collide on created entities.
export function unique(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

// Sign in through the real UI and confirm we land back in the app.
export async function signIn(page: Page): Promise<void> {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email", { exact: true }).fill(E2E_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await expect(page).not.toHaveURL(/\/auth\/sign-in/);
}
