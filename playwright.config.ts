import { defineConfig, devices } from "@playwright/test";

// E2E regression net for the judge flows (ROADMAP Phase 5 deliverable, front-loaded as the
// safety net before Phase 4 polish). The guest suite runs with no configuration; the
// authenticated suite auto-skips until Supabase + E2E_EMAIL/E2E_PASSWORD are provided.
// See ProjectDocs/PHASE3_GATE_VERIFICATION.md.

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // First-time dev compilation of a route can be slow; give navigations room.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    navigationTimeout: 60_000,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
