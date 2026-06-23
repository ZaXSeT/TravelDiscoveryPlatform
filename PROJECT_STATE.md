# PROJECT_STATE — Orbis (Travel Discovery Platform, formerly "GO")

> Snapshot date: **2026-06-23**
> Build health: `npx tsc --noEmit` ✅ 0 errors · `npm run build` ✅ 62 routes.
> Git: branch `main`, **working tree clean, in sync with `origin/main` (0 unpushed)**.
> ⬇️ Read **"CURRENT STATE — 2026-06-23"** first; the older "TL;DR / Pending / Blockers"
> sections below are from the 2026-06-19 snapshot and are kept for history only.

---

## ⭐ CURRENT STATE — 2026-06-23 (read this first)

The project has moved **far past** the 2026-06-19 snapshot below. On top of the Phase 3
CRUD spine it is now a competition build with **AI itineraries, a 3D globe, and Travel DNA**.
Where this section disagrees with anything lower down, **this section wins.**

### Major features built since the old snapshot
- **Interactive 3D globe** — Three.js / react-three-fiber, custom day/night shader, clouds,
  bump + ocean specular; a **photo marker on every one of the 46 destinations** (click →
  detail). Desktop-first. (`src/features/globe`)
- **AI Journey Builder** (`src/features/trip-generator`) — **overrides decision D4**. Real
  day-by-day itineraries via **Gemini** (`@google/genai`, model `gemini-2.5-flash`) with
  **Google Search grounding** (real places + accurate coordinates), a Leaflet route map with
  numbered markers, and a budget estimate. Pipeline: user input → **catalog destination
  (source of truth)** → Travel DNA → Gemini → editable itinerary → save. Has **result
  caching**, **rate limiting** (guest 3/day per IP, account 5/min + 10/day), and a
  **deterministic offline fallback** so the user always gets a plan.
- **Travel DNA assessment** (`src/features/travel-dna`) — 8-question quiz → radar + archetype
  + ranked destination matches with "why". Saved to `profiles.travel_dna`; **personalizes**
  the AI builder (User DNA + Destination DNA fed to Gemini).
- **46 destinations** (`src/constants/destinations.ts`), each with DNA + coordinates + photo.
- **Toasts** (`sonner`) on auth (login/logout/welcome), wishlist, journal, trip, DNA, profile.
- **Account management** — delete account (Danger zone, service-role + cascade + storage
  purge + typed-DELETE confirm), **confirm-password** on sign-up, **duplicate-email guard**,
  avatar **cropper**, client-side **image compression** for uploads.
- **Slim navbar** — Explore · Plan · Journal · Profile (+ Sign out). Travel DNA reached
  contextually (home AI section, Plan banner, Profile), not a nav item.

### This session's changes (2026-06-23)
1. **Confirm-password** field on sign-up (Zod `.refine`, server-validated).
2. **Delete account** from Profile → Danger zone (`src/lib/supabase/admin.ts` service-role
   client + `deleteAccount` in `src/features/profile/actions.ts` + `delete-account-button.tsx`).
3. **Duplicate-email signup blocked** in both email-confirm ON (empty `identities`) and OFF
   ("already registered") modes — `src/features/auth/actions.ts`.
4. **Navbar slimmed** — Travel DNA removed from nav (`src/components/layout/header.tsx`).
5. **AI plan ordering hardened** — items sorted by `startTime` per day in the Gemini path;
   prompt enforces chronological order + one geographic cluster per day + real coords
   (`src/features/trip-generator/ai/gemini.ts`). Verified with a live Paris 4-day grounded call.
6. **Day-title doubling fixed** — titles are theme-only (engine + Gemini + save strip "Day N");
   the UI prints the "Day N" label (`result-preview.tsx`, `engine/index.ts`, `actions.ts`).
7. **Journal "Save changes"** now redirects to the journal detail page (`journal-editor.tsx`).

### Verified working (live, this session)
- Guest generate → real Gemini grounded itinerary; **4/4 days ordered, times chronological,
  coordinates accurate** (`POST /trip-generator 200` ~37s cold).
- Service-role key **valid**; account-deletion path ready (not run live — destructive).
- `profiles.travel_dna` column **exists**; Travel DNA save works.
- Duplicate-email signup **blocked** with a clear message.

### ⚙️ Continue on your laptop
Everything is committed **and pushed** (origin/main, 0 unpushed). On the other machine:
1. `git pull`
2. `npm install`  *(new deps: three, @react-three/fiber+drei, @google/genai, sonner, leaflet,
   react-leaflet, framer-motion, gsap, zustand)*
3. Recreate **`.env.local`** (gitignored — base it on `.env.example`). Needed for full features:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
   - `SUPABASE_SERVICE_ROLE_KEY` — **required for account deletion**
   - `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash` — AI Builder (billing enabled)
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - *(optional)* `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — dev falls back to picsum placeholders
4. `npm run dev`
- **DB is a hosted Supabase project (shared)** — migrations are already applied to it:
  `profiles.travel_dna` ✅ and all **46 destinations seeded** ✅. The laptop talks to the same
  DB, so **no DB re-setup** is needed (unless you point at a brand-new Supabase project, in
  which case run `supabase/setup.sql`).

### Pending / next ideas
- Phase 5 hardening: security headers/CSP, SEO/OG finalization, Playwright e2e of judge flows.
- *(optional)* embed Travel DNA quiz into the Plan page; further visual polish.

### Known quirks (not bugs)
- After a `.next` rebuild, an **already-open browser tab** can show *"Couldn't generate a trip"*
  (stale server-action id). Fix: restart dev + **hard-refresh (Ctrl+Shift+R)**.
- Gemini cold grounded call ~37s, warm ~25s; identical inputs are served from cache.

---

## TL;DR

The project sits at the **end of Phase 3 (Authenticated CRUD Spine)** — the demo-ready
milestone. All four CRUD domains (wishlist, itinerary, journal, profile) are implemented
with Server Actions, RLS-backed reads, and loading/error/empty states. **Phase 4 (visual
polish) and Phase 5 (hardening/deploy) have not started.** The remaining Phase 3 work is
*verification*, not construction: proving the 7 judge flows + refresh-persistence on
mobile and desktop, and running the RLS verification script against a live database.

> Update (2026-06-19): `README.md`, `supabase/README.md`, and the two stale middleware
> comments have been reconciled to reality, and an executable gate runbook now exists at
> [`ProjectDocs/PHASE3_GATE_VERIFICATION.md`](ProjectDocs/PHASE3_GATE_VERIFICATION.md).
> The only remaining Phase 3 work is running that runbook against a live Supabase.

---

## Completed phases

| Phase | Name | Status | Evidence |
|-------|------|--------|----------|
| 0 | Foundations & Contracts | ✅ Complete | `ProjectDocs/Phase0/` (14 specs + ROADMAP) |
| 1 | Backend & Data | ✅ Complete | 4 migrations + seed + RLS verification script in `supabase/` |
| 2 | Product Spine (guest + auth + shell) | ✅ Complete | Home/Explore/Destination, auth UI, cookie-auth clients |
| 3 | Authenticated CRUD Spine | ✅ Code-complete (verification pending) | `src/features/{wishlist,itinerary,journal,profile}` |

### Phase 1 — Backend & Data
- 8 tables, 3 enums, `updated_at` triggers, `on_auth_user_created` profile trigger
  ([schema](supabase/migrations/20260619120000_schema.sql)).
- RLS enabled on every table; ownership = `auth.uid()`; public read for destinations +
  published journals ([rls](supabase/migrations/20260619120100_rls.sql)).
- Storage buckets `avatars` + `journal-media`, owner-only write by `{user_id}/…` path
  prefix ([storage](supabase/migrations/20260619120200_storage.sql)); later made
  public-read ([public-read](supabase/migrations/20260619130000_storage_public_read.sql)).
- Seed: 5 fixed-UUID destinations + 3 public seed journals ([seed.sql](supabase/seed.sql)).
- RLS verification script present ([rls_verification.sql](supabase/tests/rls_verification.sql)) — **not yet run against a live DB (see blockers).**

### Phase 2 — Product Spine
- Next.js 15 App Router, TS strict, Tailwind + tokens, shadcn-style primitives.
- Global shell: header (transparent→glass), mobile menu, footer, page container,
  section header, skip link.
- Feedback states: loading/skeleton, empty, error + error boundaries.
- Guest pages: Home (hero, featured, category tiles, **static globe** + accessible
  destination list, inspiration, CTA), Explore (search + filter), Destination detail
  (hero, DNA radar, budget, gallery, hidden gems, nearby, Leaflet map).
- Auth UI: sign-up / sign-in / reset / update-password + callback route.
- Supabase SSR cookie clients (browser/server/middleware); Zod contracts.

### Phase 3 — Authenticated CRUD Spine
- **Wishlist**: idempotent add (handles unique-violation `23505`), remove, `/wishlist`
  grid ([actions](src/features/wishlist/actions.ts)).
- **Itinerary planner**: create/rename/delete; days add/rename/delete/**reorder**
  (temp-index swap avoids the `unique(itinerary_id, day_index)` violation); items
  add/edit/delete; server-side **budget recompute** ([actions](src/features/itinerary/actions.ts)).
- **Journal**: create/edit/**soft-delete** (`deleted_at`), draft/publish (`visibility` +
  `published_at`), cover + gallery **image upload** to Supabase Storage, XSS-safe
  markdown renderer ([actions](src/features/journal/actions.ts),
  [body](src/features/journal/components/journal-body.tsx)).
- **Profile hub**: info + avatar edit; stats; connected lists linking out to
  wishlist/itineraries/journals ([profile/page.tsx](src/app/profile/page.tsx)).
- **Route protection**: middleware redirect-with-`returnTo`
  ([middleware](src/lib/supabase/middleware.ts#L7-L21)) + page-level
  [requireUser()](src/lib/auth/require-user.ts) (defense in depth).

---

## Pending phases

| Phase | Name | Status | Scope (from ROADMAP) |
|-------|------|--------|----------------------|
| 4 | Signature Visual Polish | ⛔ Not started | Interactive WebGL globe (desktop, capability-gated), GSAP scroll storytelling, Framer Motion page transitions, premium refinement. Must be **non-breaking** to Phase 3 flows. |
| 5 | Hardening, Perf, SEO, Deploy, Demo | ⛔ Not started | Security headers + CSP, journal sanitization hardening, rate-limit verification, SEO/OG polish, bundle budgets, **Playwright e2e of judge flow**, staging→prod, demo rehearsal. Optional: rule-based AI Trip Generator (D4). |

**Phase 4 not started** — `three` / `@react-three`, `framer-motion`, `gsap` are absent
from [package.json](package.json); the globe is the static image
([static-globe.tsx](src/features/home/components/static-globe.tsx)); `Reveal` is a
CSS/IntersectionObserver shim explicitly noting the animation library arrives in Phase 4
([reveal.tsx](src/components/motion/reveal.tsx)).

---

## Implemented features

| Domain | Create | Read | Update | Delete | Persist | Notes |
|--------|:--:|:--:|:--:|:--:|:--:|-------|
| Auth (sign-up/in/reset/update) | ✅ | ✅ | ✅ | — | ✅ | Email confirmation, no user enumeration, neutral reset |
| Wishlist | ✅ | ✅ | — | ✅ | ✅ | Idempotent saves |
| Itinerary | ✅ | ✅ | ✅ | ✅ | ✅ | Days + items + reorder + budget recompute |
| Journal | ✅ | ✅ | ✅ | ✅ (soft) | ✅ | Image upload, draft/publish |
| Journal images | ✅ | ✅ | ✅ (cover) | ✅ | ✅ | Supabase Storage, owner-only write |
| Profile | — | ✅ | ✅ | — | ✅ | Info + avatar; connected hub |
| Destinations (guest) | — | ✅ | — | — | ✅ | Static/seeded, read-only (D1) |
| Explore (search/filter) | — | ✅ | — | — | n/a | Client-side filtering |
| Static globe | — | ✅ | — | — | n/a | Image + accessible list; interactive globe is Phase 4 |

---

## Unfinished features

- **Phase 3 gate verification** — the 7 judge flows + refresh-persistence proven
  end-to-end on **mobile and desktop**; RLS verification script run against a live DB.
  *(Code exists; live verification is the gap.)*
- **Interactive WebGL globe** (Phase 4) — static placeholder only today.
- **Scroll storytelling / page transitions** (Phase 4) — no GSAP/Framer Motion.
- **Full markdown + sanitizer** — current renderer is deliberately minimal-but-safe
  (headings + bullets, React-escaped, no raw HTML). Full markdown is a Phase 5 enhancement.
- **Security headers + CSP** (Phase 5) — not configured.
- **Rate limiting** (Phase 5 / D6, optional) — `UPSTASH_*` env names reserved in
  [.env.example](.env.example) but **no limiter implemented**.
- **SEO finalization / OG images** (Phase 5) — `robots.ts` + `sitemap.ts` exist; OG
  imagery + final metadata tuning pending.
- **Automated tests** — Playwright e2e net added (`e2e/`, `playwright.config.ts`): the
  **guest suite passes now — 18/18 on desktop + mobile** (home, explore filter,
  destination, 404, sign-in form, auth-gate redirects); the **authenticated CRUD suite**
  (flows 3–7 with refresh-persistence) is written but auto-skips (8 skipped) until
  Supabase + `E2E_EMAIL`/`E2E_PASSWORD` are set. No unit tests yet.
- **AI Trip Generator** (D4, optional, Phase 5) — Zod contract exists
  ([tripGenerateSchema](src/lib/validation/content.ts)); rule engine not built.
- **Self-hosted fonts** — `public/fonts/` not populated; system font stack in use
  (build unaffected).

---

## Important architectural decisions

Locked decisions from [`ProjectDocs/Phase0/00_PHASE0_OVERVIEW.md`](ProjectDocs/Phase0/00_PHASE0_OVERVIEW.md)
(these supersede conflicting statements in the original `ProjectDocs/*.txt`):

| # | Decision | Consequence |
|---|----------|-------------|
| D1 | Destinations are **static & seeded** (5 fixed entries) | No destination CRUD, no admin UI; content seeded into Postgres + delivered via Cloudinary |
| D2 | **Mobile globe fallback** approved | WebGL globe is desktop-only; mobile gets a static fallback |
| D3 | **Media split**: Cloudinary = editorial media, Supabase Storage = user uploads | Two bounded pipelines |
| D4 | AI Trip Generator is **rule-based AND optional** | No LLM, no external AI API/keys; Phase 5 only |
| D5 | **Admin panel out of scope** | Only `guest` and `user` roles at runtime |
| D6 | **Analytics & rate-limiting optional** | Hooks left open, not required for core path |

Implementation-level decisions observed in the code:

- **CRUD-first roadmap** — product spine (persistent CRUD) built and hardened *before*
  heavy visuals; animation is last. Completion gate is **CRUDR** (Create-Read-Update-
  Delete-**Refresh**) on mobile + desktop.
- **RLS is the security boundary** — every query runs under the user's anon-key session;
  the service role is never used at runtime (only seed/admin scripts).
- **Defense in depth on auth** — middleware route gating + page-level `requireUser()`.
- **Server Actions return a typed `ActionResult`** (`ok`/`fail`) and are Zod-validated via
  a shared [getAuthedContext()](src/lib/actions/context.ts); Zod contracts shared FE/BE.
- **Money as integer cents (USD)**, single-currency/single-locale scope.
- **Denormalized itinerary `total_budget`** recomputed server-side from items on every
  mutation (single source of truth).
- **Soft delete for journals only** (`deleted_at`); seed entries are owner-less + public
  (enforced by a check constraint).
- **Storage**: buckets are **public-read** (so guest journal feed renders without signed
  URLs) but **owner-only write** by `{user_id}/…` path prefix; object names are
  unguessable UUIDs.
- **Image resolver abstraction** — Cloudinary in prod, deterministic `picsum.photos`
  placeholder in dev, behind one interface ([url.ts](src/lib/cloudinary/url.ts)); the
  guest experience runs with **zero configuration**.
- **Zustand for ephemeral UI state only**; server state stays on the server.

---

## Current blockers

1. ~~Docs are stale vs. reality.~~ **RESOLVED 2026-06-19.** Reconciled `README.md`,
   `supabase/README.md` (the private-bucket/signed-URL contradiction), and the two
   misleading middleware comments; added the gate runbook. Status is now trustworthy.

2. **Phase 3 gate not formally verified — the real remaining work (NEEDS YOU).**
   ROADMAP requires the 7 judge flows + refresh-persistence proven on mobile *and*
   desktop, plus `rls_verification.sql` run against a live DB. Step-by-step checklist:
   [`ProjectDocs/PHASE3_GATE_VERIFICATION.md`](ProjectDocs/PHASE3_GATE_VERIFICATION.md).

3. **No DB tooling or live environment available (gates #2).**
   At snapshot, `supabase`, `docker`, and `psql` are **not installed** and there is no
   `.env.local`. To unblock, provide **either**: (A) Docker + Supabase CLI for a local
   stack, **or** (B) a hosted Supabase dev project's URL + anon key. The guest experience
   runs config-free, but **no Phase 3 flow can be exercised until one of these exists.**

4. ~~No automated regression net before Phase 4.~~ **PARTIALLY ADDRESSED 2026-06-19.**
   A Playwright e2e net now exists (`e2e/`) and the **guest suite is verified green —
   18/18 on desktop + mobile** (`npx playwright test e2e/guest.spec.ts`). The
   **authenticated CRUD suite is written but auto-skips** until a live Supabase + a
   confirmed user (`E2E_EMAIL`/`E2E_PASSWORD`) are provided — same dependency as blocker
   #3. Run `npm run test:e2e` once infra exists to light up flows 3–7.

---

## Recommended next step

Run [`ProjectDocs/PHASE3_GATE_VERIFICATION.md`](ProjectDocs/PHASE3_GATE_VERIFICATION.md)
end-to-end once a Supabase instance is available (blocker #3): DB gate → 7 judge flows →
refresh-persistence on mobile + desktop. On a clean pass, mark Phase 3 **complete** in
`README.md` / `ROADMAP.md` — then Phase 4 (Visual Polish) may begin, additive and
non-breaking.
