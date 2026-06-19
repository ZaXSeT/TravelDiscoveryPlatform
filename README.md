# GO — Travel Discovery Platform

A cinematic, editorial travel discovery platform. Built with Next.js 15, TypeScript,
Tailwind, and Supabase. See [`ProjectDocs/`](ProjectDocs/) for the full specs and
[`ProjectDocs/Phase0/ROADMAP.md`](ProjectDocs/Phase0/ROADMAP.md) for the phase plan.

## Status

- **Phase 0 — Foundations & Contracts:** complete (`ProjectDocs/Phase0`).
- **Phase 1 — Backend & Data:** complete (`supabase/`).
- **Phase 2 — Product Spine:** complete — app foundation + guest experience
  (Home, Explore, Destination) + cookie-auth integration.
- **Phase 3 — Authenticated CRUD Spine:** code-complete — wishlist, itinerary planner,
  journal (image upload + soft delete), and the connected profile hub. The live gate
  (7 judge flows + refresh-persistence) is pending a configured Supabase instance; see
  [`ProjectDocs/PHASE3_GATE_VERIFICATION.md`](ProjectDocs/PHASE3_GATE_VERIFICATION.md).
- Phase 4 (Visual polish), Phase 5 (Hardening/Deploy): pending.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + (optional) Cloudinary values
npm run dev                  # http://localhost:3000
```

The **guest experience runs without any configuration** — destination content is static
and images fall back to deterministic placeholders when no Cloudinary cloud is set.
Authentication requires Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and the Phase 1 database (`supabase/`).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture (Phase 2)

- **App Router**, Server Components by default; client islands for interactivity.
- **Static/SSG** public pages (Home, Explore, Destination) for SEO + performance;
  **dynamic** auth pages.
- **Supabase SSR** cookie auth (`src/lib/supabase`), session refreshed in `middleware.ts`.
- **Zod contracts** shared FE/BE (`src/lib/validation`).
- **Zustand** for ephemeral UI state only (`src/stores`, `src/features/*/stores`).
- Design tokens in `src/app/globals.css`; Tailwind maps semantic names.
- Folder conventions: [`ProjectDocs/Phase0/10_FOLDER_STRUCTURE.md`](ProjectDocs/Phase0/10_FOLDER_STRUCTURE.md).

## Notes

- Self-hosted fonts go in `public/fonts/` (license-clear woff2). Until added, the system
  font stack is used (build is unaffected).
- The interactive globe and scroll animations are Phase 4; Phase 2 ships the static globe.
