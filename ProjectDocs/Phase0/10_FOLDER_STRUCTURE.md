# 10 — Folder Structure & Conventions

Source tree for the Next.js 15 App Router project. Enforces
[15_CODE_STANDARDS](../15_CODE_STANDARDS.txt) (server components by default, reusable
hooks/ui, <300 lines/component, <100 lines/hook, separation of animation from business
logic) and the architecture decisions in this folder. **Spec only — created in Phase 1.**

```
travel-discovery/
├── public/
│   ├── textures/                 earth-day, earth-bump, earth-clouds, stars (globe, desktop)
│   ├── brand/                    logo, favicon, og fallback
│   └── fonts/                    self-hosted woff2 (Clash Display, Satoshi, Inter — subset)
│
├── src/
│   ├── app/                                  # App Router (routes = thin; logic lives in features/)
│   │   ├── layout.tsx                         root layout (fonts, ScrollProvider, header/footer)
│   │   ├── page.tsx                           Home (SSG)
│   │   ├── globals.css                        tailwind layers + token CSS vars
│   │   ├── (marketing)/                       grouping for public editorial routes
│   │   │   ├── explore/page.tsx               (SSG)
│   │   │   ├── destinations/[slug]/page.tsx   (SSG, generateStaticParams)
│   │   │   ├── trip-generator/page.tsx        (SSG shell)
│   │   │   └── journal/
│   │   │       ├── page.tsx                   feed (ISR)
│   │   │       └── [slug]/page.tsx            detail (ISR)
│   │   ├── (app)/                             authenticated area (dynamic)
│   │   │   ├── wishlist/page.tsx
│   │   │   ├── itineraries/page.tsx
│   │   │   ├── itineraries/[id]/page.tsx
│   │   │   ├── journal/new/page.tsx
│   │   │   ├── journal/[slug]/edit/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── auth/                              sign-in, sign-up, reset, update-password, callback
│   │   ├── api/                               Route Handlers (storage signing, sitemap, robots)
│   │   ├── not-found.tsx
│   │   ├── error.tsx                          root error boundary
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── opengraph-image.tsx
│   │
│   ├── features/                  # vertical slices (UI + hooks + actions per domain)
│   │   ├── destinations/
│   │   │   ├── components/        DestinationHero, DnaRadar, BudgetCard, GallerySection, HiddenGems, NearbyList, RelatedDestinations
│   │   │   └── hooks/
│   │   ├── explore/               SearchBar, FilterPanel, DestinationGrid + useExploreFilters
│   │   ├── globe/                 Globe (R3F, client, ssr:false), GlobeFallback (image), markers, arcs
│   │   ├── wishlist/             WishlistGrid, SaveButton + actions.ts (server actions) + useWishlist (zustand optimistic)
│   │   ├── itinerary/            Planner, Timeline, DayColumn, ItemCard, BudgetSummary + actions.ts
│   │   ├── trip-generator/       GeneratorForm, ResultPreview + engine/ (pure rule engine) + actions.ts
│   │   ├── journal/             JournalFeed, JournalCard, JournalEditor, ImageUploader + actions.ts
│   │   ├── profile/             ProfileHeader, StatsRow, RecentActivity + actions.ts
│   │   └── auth/                AuthModal, SignInForm, SignUpForm, ResetForm + actions.ts + usePendingIntent
│   │
│   ├── components/                # shared, presentation-only (shadcn-based)
│   │   ├── ui/                    shadcn primitives (button, input, dialog, sheet, toast, skeleton…)
│   │   ├── layout/               Header, Footer, MobileMenu, PageContainer, SectionHeader
│   │   ├── motion/               AnimatedReveal, SplitText, Parallax, PageTransition (animation logic ONLY)
│   │   └── feedback/             EmptyState, ErrorState, LoadingState, Toaster
│   │
│   ├── lib/
│   │   ├── supabase/             server.ts, browser.ts, middleware.ts (client factories) — NO service key in browser.ts
│   │   ├── cloudinary/           url builder / loader for next/image
│   │   ├── storage/              signed upload helpers (server)
│   │   ├── rate-limit/           limiter interface (+ upstash impl / no-op shim)
│   │   ├── validation/           zod schemas = the data contracts (06)
│   │   ├── auth/                 session helpers, returnTo guard, route guards
│   │   └── utils/                formatting (money/date), cn(), slugify, capability detection
│   │
│   ├── constants/
│   │   ├── assets.ts             single source of truth for media (07)
│   │   ├── destinations.ts       static destination content dataset (07 §5)
│   │   ├── routes.ts             typed route map
│   │   └── config.ts            limits, budgets-as-constants, feature flags (video/globe)
│   │
│   ├── types/                    shared TS types (db row types, domain types)
│   ├── styles/                   token definitions if not inlined in globals.css
│   ├── hooks/                    cross-feature hooks (useMediaQuery, usePrefersReducedMotion)
│   └── middleware.ts             session refresh + route gating + (optional) rate limit
│
├── supabase/
│   ├── migrations/               schema + RLS (Phase 1)
│   ├── seed/                     seed script (destinations + sample journals) using service role
│   └── tests/                    RLS verification tests (Phase 1 gate)
│
├── e2e/                          Playwright (judge demo flow — Phase 5)
├── ProjectDocs/                  specs (this set lives in ProjectDocs/Phase0)
├── .env.example                  documents all env var names (no values)
├── components.json               shadcn config
├── tailwind.config.ts            tokens wired to CSS vars
├── next.config.ts                images (cloudinary), security headers
└── package.json
```

---

## Conventions

| Topic | Rule |
|-------|------|
| Default component type | **Server Component**; add `"use client"` only for interactivity. |
| Feature slices | Domain logic in `features/<domain>` (components + hooks + `actions.ts`). Routes in `app/` stay thin (compose features). |
| Animation separation | All motion logic in `components/motion/*` or a feature's animation hook — **never mixed into business/data components** (code standards). |
| Mutations | Server Actions in `features/*/actions.ts`; each validates via `lib/validation` and returns the canonical result shape. |
| State | Zustand stores live in the owning feature; only ephemeral UI/optimistic/intent state. |
| No hardcoded paths/strings | Media via `constants/assets.ts`; routes via `constants/routes.ts`; tunables via `constants/config.ts`. |
| Size limits | <300 lines/component, <100 lines/hook ([15_CODE_STANDARDS](../15_CODE_STANDARDS.txt)); split when exceeded. |
| Naming | Components `PascalCase`, hooks `useX`, files match export; folders `kebab-case`. |
| Imports | Absolute via `@/` alias. |
| Types | `strict` TypeScript; DB row types generated from Supabase in Phase 1 and re-exported from `types/`. |
