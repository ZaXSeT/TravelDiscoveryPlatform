# 02 — User & Auth Flows

Covers authentication, the guest→user gate, and the primary end-to-end journeys.
Every flow defines loading / error / empty states because **a flow that cannot be
demonstrated is a failure** ([09_PRODUCT_REALISM](../09_PRODUCT_REALISM.txt)).

Runtime roles (per D5): **`guest`** (no session) and **`user`** (authenticated).
No admin.

---

## 1. Auth method & provider

- **Provider:** Supabase Auth.
- **Primary method:** Email + password.
- **Optional (low cost, high demo value):** Google OAuth. Treated as *nice-to-have*;
  email/password is the contract. If OAuth is enabled it reuses `/auth/callback`.
- **Email verification:** required (`Confirm email` ON). Unverified users may sign in
  but see a "verify your email" banner; writes are allowed once verified.
  > Demo note: for the live judge demo a pre-verified seed user exists so the flow is never blocked.
- **Session transport:** **HTTP-only cookies via `@supabase/ssr`** (see
  [05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md) §2). No tokens in `localStorage`.

### Password policy
- Min length 8, must contain letters + numbers (validated client + server via the
  contract in [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md)).
- Supabase handles hashing, lockout/throttling. App adds rate limiting on auth routes
  ([05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md) §5).

---

## 2. Auth flows

### 2.1 Sign up
```
/auth/sign-up
→ submit {email, password, displayName}
→ validate (contract) → Supabase signUp
   ├─ success → "Check your email to verify" screen (idempotent resend available)
   │            → on verify link → /auth/callback → session → returnTo or /
   └─ error   → inline field/message error (email in use, weak password, network)
```
- A `profiles` row is created for the new auth user via a **DB trigger** on
  `auth.users` insert (see [04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md) §profiles), so
  no client-side profile creation race exists.

### 2.2 Sign in
```
/auth/sign-in
→ submit {email, password}
→ Supabase signInWithPassword
   ├─ success → set cookie session → redirect returnTo || /
   └─ error   → generic "invalid credentials" (no user enumeration)
```
States: idle, submitting (button spinner, disabled), error, success-redirect.

### 2.3 Password reset
```
/auth/reset → submit {email} → always show neutral "if an account exists, we sent a link"
   (no user enumeration)
→ email link → /auth/update-password → submit {password, confirm}
→ success → session established → redirect /profile
```

### 2.4 Sign out
- Clears Supabase cookie session (server action / route), redirects to `/`.

### 2.5 Already-authenticated guard
- Visiting any `/auth/*` while signed in redirects to `returnTo || /`.

---

## 3. Route protection model

| Layer | Responsibility |
|-------|----------------|
| **Middleware** (`middleware.ts`) | Refreshes Supabase session cookie; redirects unauthenticated access to `[auth]` routes → `/auth/sign-in?returnTo=<path>`. |
| **Server component / loader** | Re-checks session; fetches only the current user's data. |
| **RLS (database)** | Final authority: enforces row ownership regardless of client. |

> Defense in depth: middleware is UX (redirect), RLS is security (truth). Never rely
> on middleware alone — see [05_SECURITY_AND_RLS](05_SECURITY_AND_RLS.md).

`returnTo` is validated to be a **same-origin relative path** to prevent open redirect.

---

## 4. Guest → User gate (critical UX moment)

Triggered when a guest performs a save-type action: **Save to Wishlist**,
**Save generated trip**, **Create itinerary**, **Create journal**.

```
Guest clicks "Save to Wishlist" on a destination
→ Intercept (no navigation loss): open Auth modal/sheet with context
     "Sign in to save Bali to your wishlist"
→ user signs in / signs up (inline, modal)
→ on success: original intent is replayed automatically
     (the destination is saved) → toast "Saved to wishlist"
→ modal closes, user stays exactly where they were
```

Contract for intent replay:
- The pending action is captured as a typed **pending-intent** object
  `{ type, payload }` (e.g. `{ type: "wishlist.add", payload: { destinationSlug } }`).
- Stored in memory (client) for the modal flow; if a full-page auth redirect is used
  instead (mobile fallback), `returnTo` carries the path and the intent is re-attempted
  on return. Intents are **idempotent** (adding an existing wishlist item is a no-op).

No fake buttons: a guest's Save always results in a real save after auth.

---

## 5. Primary journeys (with states)

Each journey lists the **empty / loading / error** handling required by Product Realism.

### 5.1 Guest discovery (no auth)
`Home → Explore → Destination`
- Loading: skeletons for grid + destination sections; hero poster shown before video.
- Empty: Explore with active filters that match nothing → "No destinations match" + reset.
- Error: section-level error boundary with retry; page never white-screens.

### 5.2 Save to wishlist
`Destination → Save (gate if guest) → /wishlist`
- Empty wishlist: editorial empty state + CTA to Explore.
- Loading: optimistic add with rollback on failure.
- Error: toast + revert optimistic state.

### 5.3 Build an itinerary
`/itineraries → New → /itineraries/[id] (planner)`
- Add day → add item (title, time, cost, optional destination link).
- Budget summary recomputes live (client) and persists per item.
- Empty: "No days yet — add your first day."
- Loading/error per mutation (add/edit/delete day & item) with optimistic UI + rollback.

### 5.4 Generate AI trip (rule-based)
`/trip-generator → inputs {budget, days, style} → preview → Save (gate if guest)`
- Engine is deterministic ([13_AI_TRIP_GENERATOR_SPEC](13_AI_TRIP_GENERATOR_SPEC.md)).
- "Save" converts the generated plan into a real `itinerary` (+ days + items).
- Loading: short computed-state animation (not fake latency — see spec).
- Empty/invalid input: inline validation; never produces an empty itinerary.

### 5.5 Create a journal
`/journal/new → write + upload images → save draft → publish`
- Image upload → Supabase Storage signed upload ([07_MEDIA…](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md)).
- Draft (private) vs Publish (public) per visibility model.
- Loading: per-image upload progress; save spinner.
- Error: failed upload isolates to that image; text not lost.

### 5.6 Profile (connected hub)
`/profile` is the **ecosystem hub** required by demo Step 8 ("the ecosystem is
connected"). It shows and links the user's actual owned content, not just counts:
- **User info:** display name, avatar, bio — editable inline (avatar via Storage).
- **Saved destinations:** the user's wishlist items (linked to destination pages).
- **Itineraries:** list of the user's itineraries (linked to the planner).
- **Journals:** list of the user's journals incl. drafts/private (linked to view/edit).
- Summary stats (counts) shown as accents, but the **lists themselves** are present.

Empty/loading/error states for each panel. All data is server-fetched (persists on
refresh).

---

## 6. Judge demo flow mapping (from updated [13_JUDGE_DEMO_FLOW](../13_JUDGE_DEMO_FLOW.txt))

5–10 minute session. The AI generator is **not** part of this flow (D4 optional).
Each step lists the CRUDR requirement that must hold.

| Step | Route(s) | Auth | Must not fail | CRUDR |
|------|----------|------|---------------|-------|
| 1 Landing | `/` | guest | hero + globe (static-first) + featured render | R |
| 2 Explore | `/explore` | guest | search + filter + browse work | R |
| 3 Destination (Bali) | `/destinations/bali` | guest | hero, gallery, DNA, budget, hidden gems, nearby, map | R |
| 4 Authentication | `/auth/*` | guest→user | register **or** login succeeds | C/R |
| 5 Wishlist | `/wishlist` | user | save Bali → navigate → **refresh persists** | C·R·D·**Refresh** |
| 6 Itinerary | `/itineraries/[id]` | user | create, add activities, save → **reload persists** | C·R·U·D·**Refresh** |
| 7 Journal | `/journal/new`, `/journal/[slug]/edit` | user | create, **upload image**, edit, **delete** | C·R·U·D·**Refresh** |
| 8 Profile (hub) | `/profile` | user | shows user info + saved destinations + itineraries + journals (connected) | R |

This sequence **is** the success metric. Phase 5 ships a Playwright e2e covering exactly
these 8 steps including the refresh-persistence assertions (zero errors gate, mobile +
desktop). The guest→user gate (§4) covers the Step 3→4→5 transition.
