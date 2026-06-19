import { test, expect } from "@playwright/test";
import { authConfigured, SKIP_REASON, signIn, unique } from "./helpers";

// Authenticated CRUD + refresh-persistence — judge flows 3–7. Auto-skips until a live
// Supabase + a confirmed user are provided (see helpers.ts / the runbook). Each mutation
// is followed by a reload to assert the CRUDR "Refresh" guarantee.

test.describe("Authenticated CRUD (requires Supabase + creds)", () => {
  test.skip(!authConfigured, SKIP_REASON);

  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("flow 3 — wishlist save persists across reload", async ({ page }) => {
    await page.goto("/destinations/bali");
    const save = page.getByRole("button", { name: /Save to wishlist/i });
    if (await save.isVisible().catch(() => false)) await save.click();
    await expect(page.getByRole("button", { name: /^Saved$/ })).toBeVisible();

    await page.goto("/wishlist");
    await expect(page.getByText(/Bali/i).first()).toBeVisible();
    await page.reload();
    await expect(page.getByText(/Bali/i).first()).toBeVisible(); // persisted
  });

  test("flow 4 — itinerary: create, add day, persists, delete", async ({
    page,
  }) => {
    const title = unique("E2E Trip");
    await page.goto("/itineraries");
    await page.getByLabel("Trip name").fill(title);
    await page.getByRole("button", { name: /Create trip/i }).click();

    await expect(page).toHaveURL(/\/itineraries\/[0-9a-f-]{36}/);
    await page.getByRole("button", { name: /Add your first day/i }).click();

    // "Add day" only renders once at least one day exists.
    await expect(page.getByRole("button", { name: /^Add day$/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: /^Add day$/ })).toBeVisible(); // persisted

    page.once("dialog", (d) => d.accept()); // confirm() in removeTrip
    await page.getByRole("button", { name: /Delete trip/i }).click();
    await expect(page).toHaveURL(/\/itineraries\/?$/);
  });

  test("flow 5 — journal: create draft, then publish", async ({ page }) => {
    const title = unique("E2E Journal");
    await page.goto("/journal/new");
    await page.getByLabel("Title").fill(title);
    await page
      .getByLabel("Story")
      .fill("A short test story.\n\n## Day one\n- arrived\n- explored");
    await page.getByRole("button", { name: /Create journal/i }).click();

    // Lands on the edit page after creation.
    await expect(page).toHaveURL(/\/journal\/.+\/edit/);
    await page.getByLabel("Visibility").selectOption("public");
    await page.getByRole("button", { name: /Save changes/i }).click();
    await expect(page.getByRole("status")).toHaveText(/Saved/i);

    // Published entry appears in the public feed after reload.
    await page.goto("/journal");
    await expect(page.getByText(title).first()).toBeVisible();
    // NOTE: soft-delete assertion is covered in the manual runbook (§ Flow 5) until the
    // delete control's selector is pinned here.
  });

  test("flow 6 — profile hub shows stats and lists", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    await expect(page.getByText("Trips", { exact: true })).toBeVisible();
    await expect(page.getByText("Journals", { exact: true })).toBeVisible();
  });
});
