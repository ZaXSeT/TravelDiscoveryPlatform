# Phase 3 Gate — Verification Runbook

> Purpose: close the **Phase 3 (Authenticated CRUD Spine)** gate from
> [`Phase0/ROADMAP.md`](Phase0/ROADMAP.md). The code is complete; this runbook is the
> live verification that was pending. Run it end-to-end and tick every box.
>
> Gate definition (ROADMAP): **all 7 must-pass judge flows complete end-to-end**, the
> **refresh test passes for every mutation** on **mobile + desktop**, and there are **no
> fake buttons, dead ends, or lost data.**

---

## 0. Why this wasn't auto-run

The docs' verification (`supabase db reset` + `psql … rls_verification.sql`) needs the
**Supabase CLI + Docker**, and the UI flows need a **configured Supabase instance**.
Neither was present in the dev environment at snapshot (`supabase`, `docker`, `psql` not
installed; no `.env.local`). Provide one of the two setups below, then this becomes a
mechanical checklist.

### What is needed from you (pick one)

**Option A — Local (no cloud account):** install [Docker](https://www.docker.com/) +
[Supabase CLI](https://supabase.com/docs/guides/cli), then the local stack is self-hosted.

**Option B — Hosted dev project:** a Supabase dev project + its `URL` and `anon key`.

Either way, create `.env.local` from [`.env.example`](../.env.example):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Cloudinary optional — images fall back to deterministic placeholders without it.
```

---

## 1. Database gate (reuse the Phase 1 gate)

Detailed steps live in [`supabase/README.md`](../supabase/README.md). Summary:

```bash
# Local (Option A)
supabase start
supabase db reset                 # applies all 4 migrations + seed.sql
psql "$DB_URL" -f supabase/tests/rls_verification.sql   # DB URL from `supabase status`

# Hosted (Option B)
supabase link --project-ref <ref> && supabase db push
# then run supabase/seed.sql and supabase/tests/rls_verification.sql in the SQL editor
```

- [ ] All 4 migrations apply with no errors.
- [ ] Seed loads: **5 destinations** + **3 public seed journals** queryable.
- [ ] `rls_verification.sql` prints **`RLS VERIFICATION PASSED`** and ends with `ROLLBACK`.
- [ ] Buckets `avatars` + `journal-media` exist (public-read, owner-only write).

> Note: `rls_verification.sql` proves cross-user isolation (user B cannot read/write user
> A's rows; anon sees only destinations + public journals). This is the DB half of the
> CRUDR **Refresh** guarantee.

---

## 2. Auth configuration (Supabase dashboard → Authentication)

Per [`supabase/README.md`](../supabase/README.md) and
[`Phase0/02_USER_AND_AUTH_FLOWS.md`](Phase0/02_USER_AND_AUTH_FLOWS.md):

- [ ] Email + password provider enabled; **Confirm email = ON**.
- [ ] **Redirect URLs** include `http://localhost:3000/auth/callback`.
- [ ] (For the demo) a pre-confirmed seed user exists so login is instant.

---

## 3. The 7 must-pass flows (run on **desktop + mobile viewport**)

Run `npm run dev`. For each flow: perform the action, then **hard-refresh (Ctrl/Cmd-R)**
and confirm the data is still there. Code references show where each flow is wired.

### Flow 1 — Register / Login
Files: [`auth/actions.ts`](../src/features/auth/actions.ts),
[`auth/callback/route.ts`](../src/app/auth/callback/route.ts).
- [ ] Sign up → "check your email" notice (confirm-email ON).
- [ ] Confirm via email link → `/auth/callback` exchanges code → redirected in.
- [ ] Sign out, sign back in. **Refresh:** session persists (cookie via middleware).
- [ ] Visiting `/wishlist` while signed out redirects to sign-in with `returnTo`.

### Flow 2 — Explore destinations
Files: [`explore/page.tsx`](../src/app/explore/page.tsx),
[`explore-client.tsx`](../src/features/explore/components/explore-client.tsx).
- [ ] Search + filters narrow the 5 destinations; cleared state shows all.
- [ ] Destination detail renders (hero, DNA radar, budget, gallery, gems, nearby, map).

### Flow 3 — Wishlist (+ persist)
Files: [`wishlist/actions.ts`](../src/features/wishlist/actions.ts),
[`save-button.tsx`](../src/features/wishlist/components/save-button.tsx),
[`use-wishlist-store.ts`](../src/features/wishlist/stores/use-wishlist-store.ts).
- [ ] Save from a destination page (guest → auth gate opens, then saves).
- [ ] Save toggles to "Saved"; appears on `/wishlist`. **Refresh:** still saved.
- [ ] Remove → disappears. **Refresh:** stays gone. Re-saving the same one is idempotent.

### Flow 4 — Itinerary CRUD (+ persist)
Files: [`itinerary/actions.ts`](../src/features/itinerary/actions.ts),
[`planner.tsx`](../src/features/itinerary/components/planner.tsx),
[`itineraries/[id]/page.tsx`](../src/app/itineraries/[id]/page.tsx).
- [ ] Create a trip → planner opens. Rename (blur). Add days; reorder up/down.
- [ ] Add items (title, time, cost, note); budget summary sums correctly.
- [ ] Edit + delete an item; budget recomputes. **Refresh:** all state persists.
- [ ] Delete a day, then the trip. **Refresh:** stays deleted; list reflects it.

### Flow 5 — Journal CRUD incl. delete + image upload
Files: [`journal/actions.ts`](../src/features/journal/actions.ts),
[`image-uploader.tsx`](../src/features/journal/components/image-uploader.tsx),
[`journal/[slug]/edit/page.tsx`](../src/app/journal/[slug]/edit/page.tsx).
- [ ] Create a draft (private); edit title/body/excerpt.
- [ ] Upload a cover + a gallery image (JPEG/PNG/WebP ≤5 MB) → renders.
- [ ] Publish (visibility → public) → appears in the public `/journal` feed.
- [ ] Soft-delete → disappears from feed **and** profile. **Refresh:** stays gone.

### Flow 6 — Profile (connected hub)
Files: [`profile/page.tsx`](../src/app/profile/page.tsx),
[`profile/actions.ts`](../src/features/profile/actions.ts).
- [ ] Edit display name + bio; upload avatar. **Refresh:** persists; nav name updates.
- [ ] Stats (Saved / Trips / Journals) correct; each list links to the real entity.

### Flow 7 — Refresh & persistence (cross-cutting)
- [ ] After every mutation above, a full reload showed the persisted result.
- [ ] Sign out and back in: wishlist, itineraries, and journals are all still present.

---

## 4. States & mobile usability (per ROADMAP)

- [ ] Every protected route has loading (`loading.tsx`), empty, and error states.
- [ ] All flows fully usable at a 375px-wide mobile viewport (tap targets, planner,
      uploader, menus).
- [ ] No fake buttons, no dead-end links, no lost data.

---

## 5. Automated e2e (Playwright)

A regression net backs the manual checklist above (`e2e/`, `playwright.config.ts`). It runs
on **desktop + mobile** projects.

```bash
npx playwright install chromium   # once
npm run test:e2e                  # boots `npm run dev` automatically
```

- [x] **Guest suite** (`e2e/guest.spec.ts`) passes with no Supabase — home, explore
      filter, destination detail, 404, and auth-gate redirects. **Verified 2026-06-19:
      18/18 on desktop-chromium + mobile-chromium.**
- [ ] **Authenticated suite** (`e2e/authenticated.spec.ts`) — set `.env.local` (Supabase)
      **and** export `E2E_EMAIL` + `E2E_PASSWORD` (a confirmed seed user); it covers
      flows 3–7 with refresh-persistence. Without those it **auto-skips** (suite stays
      green). Journal soft-delete is asserted manually in § Flow 5 until its selector is
      pinned in the spec.

## 6. Static checks (already green at snapshot)

- [x] `npm run typecheck` → exit 0.
- [x] `npm run lint` → exit 0.
- [ ] `npm run build` → succeeds (run before declaring the gate closed).

---

## Sign-off

When every box above is ticked, the Phase 3 gate is **closed**. Update
[`PROJECT_STATE.md`](../PROJECT_STATE.md), [`README.md`](../README.md), and
[`Phase0/ROADMAP.md`](Phase0/ROADMAP.md) to mark Phase 3 **complete**, then Phase 4
(Signature Visual Polish) may begin — additive and **non-breaking** to every flow above.
