# Deployment — Vercel + Supabase (Phase 5)

Step-by-step checklist to ship Orbis to production. Next.js on Vercel needs **no
`vercel.json`** — the framework, build command (`next build`), and the security headers
(from `next.config.ts`) are all auto-detected/applied.

---

## 0. Prerequisites
- [ ] Code pushed to a Git repo (GitHub/GitLab/Bitbucket).
- [ ] A **production Supabase project** — ideally separate from dev (environment isolation,
      05_SECURITY_AND_RLS §7).
- [ ] (Optional) Cloudinary account — without it, images fall back to Unsplash placeholders.
- [ ] (Optional) Upstash Redis — without it, the rate limiter is a safe no-op.

---

## 1. Production Supabase
1. **Apply schema + seed:** Supabase Studio → SQL Editor → paste [`supabase/setup.sql`](../supabase/setup.sql) → **Run** (once, on a fresh project). Creates all tables, RLS policies, triggers, and storage buckets, and seeds the **5 featured destinations + 3 journals** (Tier 2 Explore destinations are frontend-only, so they are not seeded).
2. **(Optional) verify isolation:** paste [`supabase/tests/rls_verification.sql`](../supabase/tests/rls_verification.sql) → expect `RLS VERIFICATION PASSED` (auto-rolls back).
3. **Auth → URL Configuration:**
   - [ ] **Site URL** = `https://<your-domain>`
   - [ ] **Redirect URLs** include `https://<your-domain>/auth/callback`
         (keep `http://localhost:3000/auth/callback` for local dev).
   - [ ] Decide **Confirm email**: ON = users must confirm before first login (more secure);
         OFF = register→use immediately (smoother demo).
4. **Storage:** buckets `avatars` + `journal-media` are created by `setup.sql` (public-read,
   owner-only write) — nothing else to do.
5. Copy the project's **URL** and **anon key** (Settings → API) for the next step.

---

## 2. Vercel project
1. **Import** the Git repo at vercel.com → it auto-detects **Next.js**.
2. Build settings: leave defaults (Build = `next build`, Output = `.next`, Install = `npm install`).
3. **Environment Variables** (Project → Settings → Environment Variables) — add for
   **Production** (and Preview if you want previews to work):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | prod Supabase URL | required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod anon key | required (public, RLS-protected) |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` | **required** — inlined at build; drives metadata, sitemap, OG, auth email redirect. Set before first deploy. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | cloud name | optional (else Unsplash placeholders) |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key | optional — only if you run server/seed scripts; **never** expose to client |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Upstash creds | optional — enables real rate limiting |

> `NEXT_PUBLIC_*` are build-time inlined. After changing them, **redeploy**.

4. **Deploy.**

---

## 3. Post-deploy verification
- [ ] `https://<domain>/` , `/explore`, a `/destinations/<slug>` → load, globe renders (desktop).
- [ ] `/sitemap.xml` lists all 26 destinations; `/robots.txt` ok; `/opengraph-image` renders.
- [ ] Response headers present: `Strict-Transport-Security`, `X-Frame-Options`,
      `Content-Security-Policy-Report-Only` (DevTools → Network → document → Headers).
- [ ] **Judge flow:** Register/Login → Save Bali to wishlist → refresh (persists) →
      create itinerary → add day/activity → reload (persists) → write journal + upload image →
      publish → appears in `/journal` → delete → Profile shows everything.
- [ ] **Trip Generator:** `/trip-generator` → generate → Save → lands on `/itineraries/[id]`.
- [ ] Protected routes while signed out redirect to `/auth/sign-in`.

---

## 4. Flip CSP to enforcing (after a browser check)
The CSP currently ships as **Report-Only** (never blocks). Once the deployed app is open in
a browser with **no CSP violations in the console**:
1. In [`next.config.ts`](../next.config.ts), rename the header key
   `Content-Security-Policy-Report-Only` → `Content-Security-Policy`.
2. Redeploy and re-test the journal image upload + globe (most likely to surface a missing
   source). If something breaks, add the reported origin to the matching CSP directive.

> If Next's inline bootstrap trips `script-src`, either keep `'unsafe-inline'` or move to a
> nonce-based CSP via middleware (a later hardening step).

---

## 5. Optional follow-ups
- [ ] **Cloudinary**: upload editorial media under `go/destinations/<slug>/{hero,thumbnail,...}`
      and set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to replace placeholders.
- [ ] **Upstash**: set the two env vars to turn the rate-limit shim into real limiting.
- [ ] **Lighthouse (mobile)** pass against the production URL; confirm budgets
      (08_PERFORMANCE_BUDGETS.md).
- [ ] **Custom domain** in Vercel → update `NEXT_PUBLIC_SITE_URL` + Supabase Site/Redirect URLs.
