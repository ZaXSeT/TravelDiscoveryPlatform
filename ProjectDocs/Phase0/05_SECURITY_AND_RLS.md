# 05 — Security & RLS Design

Implements [04_SECURITY](../04_SECURITY.txt) for the locked scope (roles: `guest`,
`user`; no admin — D5). Security model is **defense in depth**: middleware (UX),
Server Actions + validation (application), RLS (database = source of truth).

---

## 1. Threat model (scope-appropriate)

| Threat | Mitigation |
|--------|------------|
| User reads/writes another user's data | RLS on every user table (§3); ownership = `auth.uid()`. |
| Stored XSS via journal body/images | Server-side sanitize on write + safe render; controlled markdown (§6). |
| Open redirect via `returnTo` | Same-origin relative-path validation ([02_USER_AND_AUTH_FLOWS](02_USER_AND_AUTH_FLOWS.md) §3). |
| Malicious / oversized uploads | Signed uploads + type/size limits + bucket policies (§4). |
| Credential stuffing / brute force | Supabase throttling + app rate limiting on auth (§5). |
| Service-role key leakage | Key is server-only; never imported into client bundle (§7). |
| CSRF | Server Actions (same-site, action-token) + `SameSite=Lax` cookies (§2). |
| Clickjacking / sniffing | Security headers + CSP (§8). |
| User enumeration | Neutral auth/reset responses ([02](02_USER_AND_AUTH_FLOWS.md) §2). |

---

## 2. Auth & session model

- **`@supabase/ssr`** with **HTTP-only, Secure, `SameSite=Lax` cookies**. No JWT in
  `localStorage`/`sessionStorage` (eliminates token theft via XSS).
- `middleware.ts` refreshes the session cookie on navigation and gates `[auth]` routes.
- Two Supabase clients:
  - **Server client** (Server Components, Server Actions, Route Handlers) — uses anon
    key + the user's cookie; all queries run under the user's RLS context.
  - **Browser client** — anon key only, used sparingly (e.g. client-side auth UI
    calls). Never the service-role key.
- **Service-role key**: used only in trusted server-side scripts (seed) and, if ever
  needed, isolated server utilities — never in request paths reachable by users and
  never in the client bundle.

---

## 3. RLS policy matrix

RLS is **enabled and forced** on all tables below. Default deny; policies grant access.
Predicates use `auth.uid()`.

### profiles
| Op | Policy | Predicate |
|----|--------|-----------|
| SELECT | own profile | `id = auth.uid()` |
| INSERT | via trigger only | no client INSERT policy (created by `on_auth_user_created`) |
| UPDATE | own profile | `USING id = auth.uid()` / `WITH CHECK id = auth.uid()` |
| DELETE | none | cascades from auth user deletion only |

### destinations
| Op | Policy | Predicate |
|----|--------|-----------|
| SELECT | public read | `true` |
| INSERT/UPDATE/DELETE | none | seed uses service role, bypassing RLS |

### wishlists
| Op | Predicate (USING / WITH CHECK) |
|----|-------------------------------|
| SELECT | `user_id = auth.uid()` |
| INSERT | `WITH CHECK user_id = auth.uid()` |
| DELETE | `USING user_id = auth.uid()` |
| UPDATE | none (no mutable fields) |

### itineraries
| Op | Predicate |
|----|-----------|
| SELECT/UPDATE/DELETE | `user_id = auth.uid()` |
| INSERT | `WITH CHECK user_id = auth.uid()` |

### itinerary_days (ownership via parent)
| Op | Predicate |
|----|-----------|
| ALL | `EXISTS (SELECT 1 FROM itineraries i WHERE i.id = itinerary_id AND i.user_id = auth.uid())` |

INSERT uses the same expression in `WITH CHECK`.

### itinerary_items (ownership via grandparent)
| Op | Predicate |
|----|-----------|
| ALL | `EXISTS (SELECT 1 FROM itinerary_days d JOIN itineraries i ON i.id = d.itinerary_id WHERE d.id = day_id AND i.user_id = auth.uid())` |

### journals
| Op | Predicate |
|----|-----------|
| SELECT (public) | `visibility = 'public' AND deleted_at IS NULL` |
| SELECT (own) | `user_id = auth.uid()` (covers drafts/private) |
| INSERT | `WITH CHECK user_id = auth.uid() AND is_seed = false` |
| UPDATE | `USING user_id = auth.uid()` / `WITH CHECK user_id = auth.uid()` |
| DELETE | soft-delete only via UPDATE (`deleted_at`); hard DELETE policy: `user_id = auth.uid()` (kept for account cleanup) |

> Two SELECT policies are OR'd by Postgres: a row is visible if it's public OR owned.

### journal_images (ownership via parent)
| Op | Predicate |
|----|-----------|
| SELECT | parent journal is publicly visible OR owned: `EXISTS (SELECT 1 FROM journals j WHERE j.id = journal_id AND ((j.visibility='public' AND j.deleted_at IS NULL) OR j.user_id = auth.uid()))` |
| INSERT/DELETE | `EXISTS (SELECT 1 FROM journals j WHERE j.id = journal_id AND j.user_id = auth.uid())` |

### RLS verification (Phase 1 gate)
Phase 1 must include automated tests proving, for two distinct users A and B:
- B cannot SELECT/UPDATE/DELETE A's wishlist/itinerary/itinerary_days/itinerary_items/journal(private).
- B cannot INSERT rows with `user_id = A`.
- Anonymous cannot read any private row but **can** read destinations + public journals.

---

## 4. Storage & upload security

Buckets (Supabase Storage):

| Bucket | Public? | Contents | Path convention |
|--------|---------|----------|-----------------|
| `avatars` | private (served via signed URL) | profile avatars | `avatars/{user_id}/{uuid}.webp` |
| `journal-media` | private (served via signed URL) | journal covers + gallery | `journal-media/{user_id}/{journal_id}/{uuid}.webp` |

Storage RLS policies (path-prefix ownership):
- INSERT/UPDATE/DELETE allowed only when the first path segment after the bucket equals
  `auth.uid()` (i.e. `(storage.foldername(name))[1] = auth.uid()::text`).
- SELECT via **signed URLs** issued by a server action/route after an ownership/visibility
  check (private buckets; no public listing).

Upload validation (enforced in the signing Route Handler + client):
- Allowed MIME: `image/jpeg`, `image/png`, `image/webp` only.
- Max size: **5 MB** per image (configurable constant).
- Server re-derives content type; rejects mismatched/extension-spoofed files.
- Filenames are server-generated UUIDs (never trust client filename).
- Editorial destination media is **not** in these buckets — it is Cloudinary (D3).

---

## 5. Rate limiting

The chosen stack has no built-in app-layer limiter, so:

- **Mechanism:** Upstash Redis (REST) + a small limiter invoked in middleware / sensitive
  Server Actions. Keyed by IP (+ user id when present).
- **Targets & limits (initial):**
  - Auth (`sign-in`, `sign-up`, `reset`): 5 / 10 min / IP.
  - Upload signing: 30 / 10 min / user.
  - Journal create/publish: 20 / hour / user.
  - Generic mutation ceiling: 100 / 10 min / user.
- **Failure mode:** if Redis is unreachable, **fail open for reads, fail closed for
  auth** (degraded but safe). Limits are constants, easily tuned.
- Optional (D6): if Upstash is not provisioned for the demo, document the limiter as a
  no-op shim with the same interface so it can be enabled without code changes.

---

## 6. Input validation, sanitization & XSS

- **Every write** passes the matching contract in [06_DATA_CONTRACTS](06_DATA_CONTRACTS.md)
  (server-side, in the Server Action) before touching the DB. Client validation is UX
  only; the server is authoritative.
- **Journal body:** authored as **controlled Markdown**, not raw HTML. On write, it is
  sanitized; on render, Markdown → HTML with an allowlist (no `script`, `iframe`,
  inline event handlers, `javascript:` URLs). A sanitizer (e.g. an allowlist HTML
  sanitizer) runs server-side before persistence so stored data is already safe.
- **All other text fields** are treated as plain text and never rendered as HTML.
- React's default escaping is relied on for plain text; `dangerouslySetInnerHTML` is
  used **only** for the already-sanitized journal HTML, nowhere else.

---

## 7. Secrets & environment isolation

| Variable | Exposure | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | client | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | public, RLS-protected |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | seed/admin scripts; never `NEXT_PUBLIC_`; never imported in client components |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | client | public delivery |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | server only | only if signed editorial uploads are scripted |
| `UPSTASH_REDIS_REST_URL` / `…_TOKEN` | server only | rate limiting |

- **Environments:** separate Supabase projects for **dev** and **prod**
  (satisfies "environment isolation" in [04_SECURITY](../04_SECURITY.txt)). A staging
  project is optional. `.env.local` (dev) is git-ignored; prod vars set in Vercel.
- A committed `.env.example` documents every variable name (no values).

---

## 8. HTTP security headers (set in `next.config` / middleware)

| Header | Value (intent) |
|--------|----------------|
| `Content-Security-Policy` | Allowlist self + Supabase + Cloudinary + map tiles + Vercel; `frame-ancestors 'none'`. Tuned in Phase 5 (report-only first). |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` (with CSP `frame-ancestors`) |
| `Permissions-Policy` | disable unused features (camera, microphone, geolocation off unless map needs it) |

CSP must explicitly allow: OpenStreetMap tile hosts (Leaflet), Cloudinary res domain,
Supabase project domain, and any font host (or self-host fonts to simplify CSP — see
[11_DESIGN_TOKENS](11_DESIGN_TOKENS.md)).

---

## 9. Privacy (lightweight, scope-appropriate)

- PII stored: email (in `auth.users`), display name, optional avatar/bio. No payment data.
- A short privacy note page is recommended (public submission may be viewed in EU).
- Account deletion: deleting the auth user cascades all owned rows (FK `ON DELETE CASCADE`).
