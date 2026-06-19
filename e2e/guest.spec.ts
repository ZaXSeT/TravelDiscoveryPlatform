import { test, expect } from "@playwright/test";

// Guest experience — runs with NO Supabase configuration (static/SSG pages + the
// page-level auth gate, which redirects gracefully when env is absent).
// Judge flows 1 (gate), 2 (explore), and the public surface of 3.

test.describe("Guest experience (no Supabase required)", () => {
  test("home renders hero + globe section with destination links", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Five destinations\. One journey\./i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Bali/i }).first()).toBeVisible();
  });

  test("explore search filters the destination grid", async ({ page }) => {
    await page.goto("/explore");
    await expect(
      page.getByRole("heading", { name: /Find your next destination/i }),
    ).toBeVisible();

    const search = page.getByRole("searchbox", { name: /Search destinations/i });
    await search.fill("tokyo");
    await expect(page.getByRole("link", { name: /Tokyo/i }).first()).toBeVisible();
    await expect(page.getByText(/Bali/i)).toHaveCount(0);

    // Clearing restores the full set.
    await page.getByRole("button", { name: /Clear search/i }).click();
    await expect(page.getByRole("link", { name: /Bali/i }).first()).toBeVisible();
  });

  test("destination detail renders and offers Save", async ({ page }) => {
    await page.goto("/destinations/bali");
    await expect(page.getByRole("heading", { name: /Bali/i }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Save to wishlist/i }),
    ).toBeVisible();
  });

  test("invalid destination slug 404s", async ({ page }) => {
    const res = await page.goto("/destinations/not-a-real-place");
    expect(res?.status()).toBe(404);
  });

  test("sign-in page renders the form", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Sign in$/ })).toBeVisible();
  });

  // The auth gate (page-level requireUser) redirects anonymous users even without a
  // configured Supabase, because getOptionalUser() returns null gracefully.
  for (const path of ["/wishlist", "/itineraries", "/profile", "/journal/new"]) {
    test(`protected route ${path} redirects to sign-in with returnTo`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/sign-in\?returnTo=/);
    });
  }
});
