# Phase 0 — Foundations & Contracts

> Status: **In progress (documentation only — no implementation code)**
> Owner roles: Product, UX, Frontend Architecture, Backend Architecture, Security
> Preceded by: Architecture Review (approved)

This phase produces the binding contracts that all later phases build against. The
guiding rule from [09_PRODUCT_REALISM](../09_PRODUCT_REALISM.txt) and
[07_COMPETITION_MODE](../07_COMPETITION_MODE.txt) governs every decision here:

> **Product Realism over feature quantity. Mobile performance is a first-class constraint.**

### Governing priorities (updated after re-reading 07/09/13)

The three product docs ([07_COMPETITION_MODE](../07_COMPETITION_MODE.txt),
[09_PRODUCT_REALISM](../09_PRODUCT_REALISM.txt), [13_JUDGE_DEMO_FLOW](../13_JUDGE_DEMO_FLOW.txt))
have **equal priority to the architecture docs**. Effective priority order:

1. **Functional UX** — complete user flows that work end-to-end.
2. **Product completeness & persistence** — data survives refresh; all CRUD demonstrable.
3. **Mobile usability** — every feature fully usable on mobile.
4. **Loading / error / empty states** — designed for every feature.
5. **Visual excellence** — premium, editorial presentation.
6. **Animation** — last; never at the expense of usability.

> Do **not** optimize for architectural sophistication at the expense of product usability.

### The CRUDR completion gate (mandatory per feature)

No feature is "complete" until it passes **C-R-U-D-R**:

| | Meaning |
|---|---------|
| **C**reate | user can create the entity |
| **R**ead | it renders correctly afterward |
| **U**pdate | user can edit it (where applicable) |
| **D**elete | user can remove it (where applicable) |
| **R**efresh | **data persists after a full page reload**, and the whole flow is demonstrable |

The 7 must-pass judge flows (auth, explore, wishlist+persist, itinerary CRUD+persist,
journal CRUD incl. delete + image upload, profile hub, refresh persistence) are the
success metric. See [ROADMAP](ROADMAP.md).

---

## Approved decisions (locked for the project)

| # | Decision | Consequence |
|---|----------|-------------|
| D1 | **Destinations are static & seeded** (5 fixed entries). | No destination CRUD, no admin UI. Destination content is a typed dataset seeded into Postgres + delivered via Cloudinary. |
| D2 | **Mobile globe fallback approved.** | WebGL globe is **desktop-only**; mobile receives a static image/canvas fallback. Protects mobile performance. |
| D3 | **Media split:** Cloudinary = editorial destination media; Supabase Storage = user uploads. | Two clearly bounded pipelines. See [07_MEDIA_ASSET_PIPELINE_AND_LICENSING](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md). |
| D4 | **AI Trip Generator is rule-based AND optional.** | No LLM, no external AI API, no API keys. Deterministic engine. **Not in the judge demo flow** — built in Phase 5 only if the 7 core flows are solid. See [13_AI_TRIP_GENERATOR_SPEC](13_AI_TRIP_GENERATOR_SPEC.md) + [ROADMAP](ROADMAP.md). |
| D5 | **Admin panel out of scope.** | Admin role is *not implemented*. Only `guest` and `user` roles exist at runtime. |
| D6 | **Analytics & monitoring optional.** | Not on the Phase 0 critical path; hooks left open but not required. |

These supersede any conflicting statement in the original `ProjectDocs/*.txt`
(notably the `admin` role in [01_PRD](../01_PRD.txt)/[04_SECURITY](../04_SECURITY.txt)
and the `destinations` write path implied by [10_DATABASE_SPEC](../10_DATABASE_SPEC.txt)).

---

## Phase 0 deliverables (this folder)

| File | Purpose |
|------|---------|
| [01_INFORMATION_ARCHITECTURE](01_INFORMATION_ARCHITECTURE.md) | Sitemap, navigation model, full route table. |
| [02_USER_AND_AUTH_FLOWS](02_USER_AND_AUTH_FLOWS.md) | Auth flows + guest→user gate + all primary journeys. |
| [03_RENDERING_AND_DATA_ARCHITECTURE](03_RENDERING_AND_DATA_ARCHITECTURE.md) | Per-route rendering strategy + state/data ADR. |
| [04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md) | Full schema: columns, types, enums, keys, indexes. |
| [05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md) | RLS policy matrix, auth/token model, headers, uploads, rate limiting. |
| [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md) | Validation contracts (field-level) shared FE/BE. |
| [07_MEDIA_ASSET_PIPELINE_AND_LICENSING](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md) | Cloudinary vs Supabase boundary, `assets.ts` shape, licensing. |
| [08_PERFORMANCE_BUDGETS](08_PERFORMANCE_BUDGETS.md) | Per-route budgets, asset budgets, mobile rules. |
| [09_ACCESSIBILITY_BASELINE](09_ACCESSIBILITY_BASELINE.md) | WCAG AA targets, contrast-corrected palette, reduced motion. |
| [10_FOLDER_STRUCTURE](10_FOLDER_STRUCTURE.md) | Source tree + conventions. |
| [11_DESIGN_TOKENS](11_DESIGN_TOKENS.md) | Color/type/spacing/motion tokens. |
| [12_COMPONENT_SPEC](12_COMPONENT_SPEC.md) | Base component contracts (props/states, no code). |
| [13_AI_TRIP_GENERATOR_SPEC](13_AI_TRIP_GENERATOR_SPEC.md) | Rule-engine inputs, scoring, output, persistence (optional feature). |
| [ROADMAP](ROADMAP.md) | Revised CRUD-first phase order + per-phase gates. |

---

## Phase 0 acceptance gate

Phase 0 is complete and Phase 1 may begin only when **all** are true:

- [ ] IA + route table reviewed; every route has a rendering strategy.
- [ ] Auth flows cover sign-up, sign-in, verification, reset, sign-out, and the guest→user gate.
- [ ] DB schema defines every column/type/key/index; no `TODO`s.
- [ ] RLS policy exists for every user-owned table with a written predicate.
- [ ] Data contracts cover every write path (wishlist, itinerary, journal, profile, trip generator input).
- [ ] Media boundary unambiguous; licensing sourcing plan exists.
- [ ] Performance budgets set per route, with explicit mobile fallbacks.
- [ ] Accessibility palette passes WCAG AA for text; reduced-motion behavior defined.
- [ ] Folder structure + design tokens + component contracts approved.

**No application code is written in Phase 0.** Schema and policies appear here as
*specification* (documentation tables and predicate expressions), not as migration
files. Migrations, policies, and types are authored in Phase 1.

---

## Scope guardrails (anti-scope-creep)

Locked **out** of scope for the whole project unless explicitly reopened:

- Admin panel / destination CRUD (D1, D5).
- LLM / external AI (D4).
- Payments, bookings, real flight data, real-time collaboration.
- Multi-language / multi-currency (single locale `en`, single currency — see [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md)).
- Native apps / PWA offline mode.

Signature wow-moments (per updated [07_COMPETITION_MODE](../07_COMPETITION_MODE.txt)):
cinematic hero, interactive globe, smooth destination transitions, premium destination
pages, **the itinerary planner, and the travel journal experience**. The planner and
journal are now wow moments *and* core CRUD — they must be functional, persistent, and
mobile-usable first, then polished. The interactive globe is a **progressive
enhancement** (static globe ships first; see [ROADMAP](ROADMAP.md)).
