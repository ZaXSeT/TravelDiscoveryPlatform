# 06 — Data Contracts

Field-level validation contracts shared between client (UX validation) and server
(authoritative validation in Server Actions). In Phase 1 these become Zod schemas in a
shared module and the inferred TypeScript types are the single source of truth for both
layers. **This document is the spec; no code yet.**

Conventions:
- Money is **integer cents, USD**.
- All strings are trimmed; empty optional strings normalize to `null`.
- Server rejects unknown fields (strict parsing).
- Result shape for every action: `{ ok: true, data } | { ok: false, error: { code, message, fields? } }`.

---

## Auth

### SignUpInput
| Field | Type | Rules |
|-------|------|-------|
| `email` | string | valid email, ≤ 254 |
| `password` | string | 8–72 chars, ≥1 letter, ≥1 number |
| `displayName` | string | 2–50 chars |

### SignInInput
| Field | Type | Rules |
|-------|------|-------|
| `email` | string | valid email |
| `password` | string | 1–72 (presence only; no policy leak) |

### ResetRequestInput
| Field | Type | Rules |
| `email` | string | valid email |

### UpdatePasswordInput
| Field | Type | Rules |
|-------|------|-------|
| `password` | string | 8–72, ≥1 letter, ≥1 number |
| `confirm` | string | must equal `password` |

### ReturnTo (shared)
- `returnTo`: optional string; must match `^/(?!/)` (relative, single leading slash) →
  rejects absolute/protocol-relative URLs (open-redirect guard).

---

## Profile

### UpdateProfileInput
| Field | Type | Rules |
|-------|------|-------|
| `displayName` | string | 2–50 |
| `bio` | string \| null | ≤ 280 |
| `avatar` | upload ref | optional; see UploadConstraints |

---

## Wishlist

### WishlistAddInput
| Field | Type | Rules |
|-------|------|-------|
| `destinationSlug` | string | must be one of the 5 known slugs |

- Server resolves slug → `destination_id`. Insert is idempotent (unique constraint);
  duplicate = success no-op (`ok: true`).

### WishlistRemoveInput
| Field | Type | Rules |
| `destinationSlug` | string | known slug |

---

## Itinerary

### ItineraryCreateInput
| Field | Type | Rules |
|-------|------|-------|
| `title` | string | 1–120 |
| `destinationSlug` | string \| null | known slug or null |
| `startDate` | ISO date \| null | valid date, not absurdly far (±5 yrs) |

### ItineraryUpdateInput
| Field | Type | Rules |
|-------|------|-------|
| `id` | uuid | required; ownership enforced by RLS |
| `title` | string | 1–120 |
| `destinationSlug` | string \| null | known slug or null |
| `startDate` | ISO date \| null | valid |

### DayCreateInput
| Field | Type | Rules |
|-------|------|-------|
| `itineraryId` | uuid | required |
| `title` | string \| null | ≤ 120 |
| `dayIndex` | int | ≥ 1; server may auto-assign next index |

### DayReorderInput
| Field | Type | Rules |
|-------|------|-------|
| `itineraryId` | uuid | required |
| `orderedDayIds` | uuid[] | permutation of the itinerary's day ids |

### ItemCreateInput / ItemUpdateInput
| Field | Type | Rules |
|-------|------|-------|
| `dayId` | uuid | required (create) |
| `id` | uuid | required (update) |
| `title` | string | 1–160 |
| `startTime` | `HH:mm` \| null | 24h time or null |
| `cost` | int (cents) | 0 – 100,000,00 (≤ $100k) |
| `note` | string \| null | ≤ 500 |
| `destinationSlug` | string \| null | known slug or null |

- After any item mutation the action recomputes `itineraries.total_budget` in the same
  transaction ([04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md) triggers note).

---

## Journal

### JournalCreateInput
| Field | Type | Rules |
|-------|------|-------|
| `title` | string | 1–140 |
| `excerpt` | string \| null | ≤ 280 |
| `bodyMarkdown` | string | 1–20,000 chars; sanitized server-side (security §6) |
| `destinationSlug` | string \| null | known slug or null |
| `visibility` | enum | `private` \| `public` (default `private`) |
| `coverUpload` | upload ref \| null | UploadConstraints |

- `slug` is **server-generated** from title (kebab) + short uid; immutable after publish.
- `is_seed` is never settable by clients (forced false).

### JournalUpdateInput
- Same as create + `id` (uuid). `slug` not editable. Setting `visibility=public` the
  first time sets `published_at`.

### JournalDeleteInput
| Field | Type | Rules |
| `id` | uuid | required; performs soft delete (sets `deleted_at`) |

### JournalImageAddInput
| Field | Type | Rules |
|-------|------|-------|
| `journalId` | uuid | required |
| `upload` | upload ref | UploadConstraints |
| `alt` | string \| null | ≤ 160 |
| `position` | int | ≥ 0 |

---

## Trip Generator (rule-based — see [13_AI_TRIP_GENERATOR_SPEC](13_AI_TRIP_GENERATOR_SPEC.md))

### TripGenerateInput
| Field | Type | Rules |
|-------|------|-------|
| `budget` | int (cents) | 10,000_00 min sensible? → range $200–$50,000 (20,000_00 cents min/max bounds) |
| `days` | int | 1–14 |
| `style` | enum | `adventure` \| `culture` \| `food` \| `nature` \| `luxury` |
| `destinationSlug` | string \| null | optional preferred destination (known slug) |

- Validated client-side for instant feedback; the engine runs client-side and is
  re-validated server-side **only at save time** (TripSaveInput).

### TripSaveInput
| Field | Type | Rules |
|-------|------|-------|
| `title` | string | 1–120 (default from destination + days) |
| `style` | enum | travel_style |
| `destinationSlug` | string | known slug |
| `days` | array | generated day/item structure, each item re-validated against ItemCreateInput rules |

- On save the server **re-runs the deterministic engine** with the same inputs and
  verifies the client-submitted plan matches (prevents tampering / arbitrary inserts),
  then persists as a real itinerary (`source = 'generated'`).

---

## Shared: UploadConstraints
| Rule | Value |
|------|-------|
| MIME | `image/jpeg`, `image/png`, `image/webp` |
| Max size | 5 MB |
| Dimensions | server may downscale to max 2560px long edge (Phase implementation) |
| Filename | server-generated UUID; client name ignored |

## Error codes (canonical)
| Code | Meaning |
|------|---------|
| `unauthorized` | no session for an `[auth]` action |
| `forbidden` | RLS/ownership denied |
| `validation` | contract failed (includes `fields`) |
| `not_found` | target row missing |
| `rate_limited` | limiter triggered |
| `conflict` | unique violation handled as no-op or surfaced |
| `server_error` | unexpected |
