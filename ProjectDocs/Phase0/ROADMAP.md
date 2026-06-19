# ROADMAP — CRUD-First Development Strategy

Revised phase order after re-reading [07_COMPETITION_MODE](../07_COMPETITION_MODE.txt),
[09_PRODUCT_REALISM](../09_PRODUCT_REALISM.txt), [13_JUDGE_DEMO_FLOW](../13_JUDGE_DEMO_FLOW.txt)
(equal priority to architecture). The product spine (working, persistent CRUD) is built
and hardened **before** the heavy interactive visuals. Animation is last.

> **Priority order:** Functional UX → Product completeness & persistence → Mobile
> usability → Loading/error/empty states → Visual excellence → Animation.

---

## The completion gate that applies to every feature: CRUDR

A feature is **not** complete until it passes:

| C | R | U | D | R |
|---|---|---|---|---|
| Create | Read (renders) | Update | Delete | **Refresh — data persists after full reload, full flow demonstrable** |

…on **both mobile and desktop**, with loading / error / empty states present.

The 7 must-pass judge flows (the success metric):
1. Register / Login
2. Explore destinations
3. Save destinations to wishlist
4. Create and edit itineraries
5. Create, edit and delete journals
6. View profile (connected hub)
7. Refresh and keep data persisted

---

## Phase order (revised)

| Phase | Name | Was | Why moved |
|-------|------|-----|-----------|
| 1 | Backend & Data | — | Foundation for persistence + RLS. |
| 2 | Product Spine (guest + auth + shell) | Core frontend | Needed for demo steps 1–4; static, low risk. |
| 3 | **Authenticated CRUD Spine** | *was Phase 4* | **The heart + the demo. Reached as early as possible.** |
| 4 | Signature Visual Polish | *was Phase 3* | Additive; must never break a working flow. |
| 5 | Hardening, Perf, SEO, Deploy, Demo | — | + AI generator only if time remains. |

Globe is **static-first** in Phase 2 and upgraded to interactive in Phase 4
(progressive enhancement). AI Trip Generator is **optional**, Phase 5 only.

---

## Phase 1 — Backend & Data  *(current)*

**Deliverables**
- Supabase migrations: extensions, enums, all tables, constraints, indexes, triggers.
- RLS enabled + policies for every table (ownership = `auth.uid()`).
- Storage buckets (`avatars`, `journal-media`) + path-prefix ownership policies.
- Auth configuration (email/password + verification + redirect URLs).
- Seed data: 5 static destinations (fixed UUIDs) + sample/seed journals.
- Shared data contracts (designed in [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md); executable
  Zod lands with the Phase 2 scaffold).
- RLS verification script + `.env.example` + backend setup/gate README.

**Gate** — all data models, RLS, storage, and contracts **support the full judge demo
flow + persistence**:
- [ ] Every table from [04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md) exists with correct types/keys/indexes.
- [ ] RLS proven: user B cannot read/write user A's wishlist/itinerary/days/items/private journal; anon can read destinations + public journals only.
- [ ] Storage policies proven: a user can only write under their own `{user_id}/…` path.
- [ ] `on_auth_user_created` creates a `profiles` row automatically.
- [ ] Seed loads: 5 destinations + ≥3 seed journals queryable.
- [ ] A round-trip insert→select (per table) persists (the DB half of CRUDR Refresh).

---

## Phase 2 — Product Spine (guest experience + auth + shell)

**Deliverables**
- Next.js 15 scaffold, TS strict, Tailwind + tokens, shadcn themed, fonts self-hosted.
- Executable Zod contracts ([06_DATA_CONTRACTS](06_DATA_CONTRACTS.md)).
- Global layout: Header (transparent→glass), MobileMenu, Footer, PageContainer, SectionHeader.
- State components: Loading/Skeleton, EmptyState, ErrorState; error boundaries.
- Home (static hero w/ poster + **static globe/featured**), Explore (search/filter),
  Destination detail (hero, DNA, budget, gallery, hidden gems, nearby, map).
- Auth UI (sign-up/in/reset/update) + middleware route protection + guest→user gate.
- Supabase server/browser clients (cookie auth).

**Gate**
- [ ] Guest flow Home→Explore→Destination→Login prompt works, **mobile + desktop**.
- [ ] Auth works end-to-end; protected routes redirect; session persists on refresh.
- [ ] Lighthouse + a11y pass on public routes ([08](08_PERFORMANCE_BUDGETS.md)/[09](09_ACCESSIBILITY_BASELINE.md)).

---

## Phase 3 — Authenticated CRUD Spine  *(demo-ready milestone)*

**Deliverables (each must pass CRUDR)**
- **Wishlist:** add/remove from destination + explore; `/wishlist` list; persists.
- **Itinerary:** create; planner with days + items; edit/delete; mobile reorder;
  budget summary; persists & reloads.
- **Journal:** create; **image upload** (signed → `journal-media`); edit; **delete**
  (soft); draft/publish; persists.
- **Profile (connected hub):** info edit (+avatar); lists wishlist + itineraries +
  journals with links; persists.
- All with loading / error / empty states and mobile usability.

**Gate (this is the demo)**
- [ ] **All 7 must-pass flows complete end-to-end.**
- [ ] **Refresh test passes for every mutation** on mobile + desktop.
- [ ] No fake buttons, no dead ends, no lost data.

---

## Phase 4 — Signature Visual Polish  *(additive, non-breaking)*

**Deliverables**
- Interactive globe (Three.js/R3F, desktop, capability-gated; upgrades the static globe).
- Scroll storytelling (GSAP via single ScrollProvider), smooth destination transitions,
  page transitions (Framer Motion), premium refinement of destination/planner/journal.

**Gate**
- [ ] Performance budgets still met ([08](08_PERFORMANCE_BUDGETS.md)); globe excluded from mobile bundle.
- [ ] Reduced-motion path verified.
- [ ] **Regression:** every Phase 3 flow + refresh test still passes.

---

## Phase 5 — Hardening, Perf, SEO, Deploy, Demo

**Deliverables**
- Security headers + CSP, journal sanitization, rate-limit verification ([05](05_SECURITY_AND_RLS.md)).
- SEO: metadata, `sitemap.xml`, `robots.txt`, OpenGraph images.
- Final Lighthouse tuning; bundle-budget enforcement.
- **Playwright e2e of the 8-step judge flow incl. refresh-persistence assertions.**
- Seed + pre-warm; staging→prod; demo rehearsal.
- **Optional:** AI Trip Generator ([13](13_AI_TRIP_GENERATOR_SPEC.md)) — only if core flows are solid.

**Gate**
- [ ] Full 8-step judge demo passes e2e with **zero errors**, mobile + desktop.
- [ ] Production checklist complete; data persists across sessions.
