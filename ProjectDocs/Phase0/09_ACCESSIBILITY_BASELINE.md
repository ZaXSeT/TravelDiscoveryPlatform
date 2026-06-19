# 09 — Accessibility Baseline

Target: Lighthouse **A11y ≥95** and **WCAG 2.1 AA** for content. Accessibility is also
increasingly scored by Awwwards/FWA, so this is competition-relevant, not just
compliance. Addresses the contrast + motion risks raised in the architecture review.

---

## 1. Color contrast (corrected palette)

The original accent gold `#C8A97E` on light backgrounds **fails WCAG AA for text**
(contrast ≈ 2:1 vs. white; AA needs 4.5:1 normal / 3:1 large). Resolution:

| Token | Value | Allowed use |
|-------|-------|-------------|
| `accent/gold` (decorative) | `#C8A97E` | Large decorative elements, borders, icons ≥24px, hairlines, non-text. **Never body text on light.** |
| `accent/gold-text` (AA) | `#8A6A3B` (darker gold) | Gold-colored **text** on white/`#F8F7F4` (meets ≥4.5:1). Use this whenever gold must be readable. |
| `text/primary` | `#111111` | Body/headings on light (passes AAA). |
| `text/secondary` | `#2A2A2A` | Secondary text on light (passes AA). |
| `text/muted` | `#555555` | Allowed for ≥16px regular / ≥14px bold on white (≈7:1, OK). Avoid on `#F1EFEA` for small text — verify. |
| `accent/blue` | `#3B82F6` | Links/CTAs — verify ≥4.5:1; darken to `#2563EB` for text-on-white if needed. |
| `accent/green` | `#2E8B57` | Status/positive; verify per use. |

Rules:
- Every text/background pairing is verified ≥4.5:1 (normal) / ≥3:1 (large ≥24px or ≥19px
  bold) before shipping. The exact verified pairings live in [11_DESIGN_TOKENS](11_DESIGN_TOKENS.md).
- On **dark sections** (hero/globe/cinematic), text is near-white (`#FFFFFF`/`#F8F7F4`)
  on dark — verify against the actual dark surface, including over imagery (use scrims).
- Text over images always uses a gradient/scrim overlay to guarantee contrast.

---

## 2. Motion & reduced motion (binding)

The vague "reduced motion when necessary" ([14_ANIMATION_SYSTEM](../14_ANIMATION_SYSTEM.txt))
is replaced by a strict rule:

- A single source of truth reads `prefers-reduced-motion: reduce`.
- When reduced motion is on:
  - **Lenis smooth scroll is disabled** → native scroll.
  - GSAP reveals collapse to **instant or opacity-only** (no large transforms, no parallax, no pinning).
  - Framer Motion transitions use minimal cross-fades (no slide/scale).
  - Autoplay video pauses/omits; globe auto-rotation stops (static).
- Reduced motion must still deliver the full content and all flows (no information is
  motion-only).
- No animation traps focus or blocks interaction (per [14_ANIMATION_SYSTEM](../14_ANIMATION_SYSTEM.txt)).

---

## 3. Keyboard & focus

- All interactive elements are reachable and operable by keyboard in a logical order.
- Visible focus ring on every focusable element (custom ring using `accent/gold` at
  decorative size + sufficient contrast; never `outline: none` without replacement).
- **Skip link** ("Skip to content") as the first focusable element.
- Modals/sheets (auth gate, mobile menu) **trap focus**, restore focus on close, and
  close on `Esc`. Background is `inert`/`aria-hidden`.
- Custom controls (filters, planner drag, radar) have keyboard equivalents
  (e.g. reorder via buttons, not drag-only).

---

## 4. Interactive globe & canvas (WebGL) accessibility

The globe is decorative + exploratory; it must not be the only way to reach content:

- The globe canvas has `role="img"` + descriptive `aria-label` (e.g. "Interactive globe
  showing five featured destinations").
- An **accessible, equivalent list** of the destinations (with the same links/markers)
  is present in the DOM near the globe for keyboard/screen-reader users (visually it can
  be the Featured Destinations section).
- On mobile (fallback image) the same list applies; image has meaningful `alt`.
- Map (Leaflet): provide text alternatives for key info; ensure controls are reachable
  or provide a static fallback with the address/coordinates in text.

---

## 5. Semantics & structure

- One `<h1>` per page; logical heading hierarchy (no skipped levels).
- Landmarks: `header/nav`, `main`, `footer`; sections labelled.
- Lists use list semantics; cards are articles/links with accessible names.
- Buttons vs links used correctly (navigation = link, action = button).
- Forms: every field has a `<label>`; errors are programmatically associated
  (`aria-describedby`) and announced; required state conveyed non-visually.
- Live regions for async results (toast on save, upload progress, validation errors).

---

## 6. Media accessibility

- All meaningful images have descriptive `alt`; decorative images `alt=""`.
- User uploads capture an optional `alt` ([04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md)
  `journal_images.alt`, `profiles` avatar alt = display name).
- Background video is decorative (`aria-hidden`), muted, with a poster; no essential
  info conveyed by video alone.
- Sufficient contrast for any text overlaid on media (scrims, §1).

---

## 7. Verification checklist (gates)

- [ ] Automated: Lighthouse A11y ≥95 on every public route; axe/Playwright a11y scan in Phase 5.
- [ ] Manual: full keyboard pass of the judge demo flow.
- [ ] Manual: screen-reader smoke test of Home, Destination, and one auth flow.
- [ ] Contrast: every shipped text/bg pair verified ≥ AA.
- [ ] Reduced-motion: full site usable with the OS setting on.
- [ ] Focus: no traps except intentional modals; focus restored on close.
