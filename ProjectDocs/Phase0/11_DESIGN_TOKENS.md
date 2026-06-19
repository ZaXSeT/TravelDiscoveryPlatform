# 11 — Design Tokens

Translates [02_DESIGN_SYSTEM](../02_DESIGN_SYSTEM.txt) into a token system, with the
contrast corrections from [09_ACCESSIBILITY_BASELINE](09_ACCESSIBILITY_BASELINE.md).
Tokens are defined once as CSS variables and wired into Tailwind (`tailwind.config.ts`)
so components reference semantic names, not raw hex. **Spec only — authored in Phase 1.**

Theme: Modern Luxury Travel — editorial, premium, minimal, spacious, cinematic.

---

## 1. Color tokens

### Surfaces (light)
| Token | Value | Use |
|-------|-------|-----|
| `--surface-0` | `#FFFFFF` | base background |
| `--surface-1` | `#F8F7F4` | sections / cards |
| `--surface-2` | `#F1EFEA` | subtle elevation / hairlined blocks |

### Surfaces (dark — hero/globe/cinematic only)
| Token | Value | Use |
|-------|-------|-----|
| `--surface-dark-0` | `#0E0E0F` | dark section base |
| `--surface-dark-1` | `#17171A` | dark cards |
| `--scrim` | `rgba(0,0,0,0.45)` | overlay on imagery for text contrast |

### Text
| Token | Value | On |
|-------|-------|----|
| `--text-primary` | `#111111` | light surfaces (AAA) |
| `--text-secondary` | `#2A2A2A` | light (AA) |
| `--text-muted` | `#555555` | light, ≥16px regular only |
| `--text-on-dark` | `#F8F7F4` | dark surfaces / over scrim |

### Accents
| Token | Value | Use | Contrast note |
|-------|-------|-----|---------------|
| `--accent-gold` | `#C8A97E` | **decorative only** (borders, icons ≥24px, lines, large display) | not for text on light |
| `--accent-gold-text` | `#8A6A3B` | gold **text** on light | AA ≥4.5:1 |
| `--accent-blue` | `#3B82F6` | interactive accent (large) | |
| `--accent-blue-text` | `#2563EB` | link/button **text** on light | AA verified |
| `--accent-green` | `#2E8B57` | positive/status | verify per pairing |
| `--focus-ring` | `#8A6A3B` | focus outline | visible on all surfaces |

> Every text/background pair must be contrast-verified before use
> ([09_ACCESSIBILITY_BASELINE](09_ACCESSIBILITY_BASELINE.md) §1). On dark, text uses
> `--text-on-dark`; over imagery always apply `--scrim`.

---

## 2. Typography tokens

Fonts (self-hosted woff2, subset — [07_MEDIA…](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md) §6):

| Role | Family | Fallback |
|------|--------|----------|
| Display/Heading | **Clash Display** | Satoshi, system serif/sans fallback |
| Subheading/UI | **Satoshi** | Inter, system-ui |
| Body | **Inter** | system-ui, sans-serif |

Type scale (fluid via `clamp`, editorial — large headlines):

| Token | Size (clamp min→max) | Use |
|-------|----------------------|-----|
| `--text-display` | 2.75rem → 5.5rem | hero headline |
| `--text-h1` | 2.25rem → 3.5rem | page titles |
| `--text-h2` | 1.75rem → 2.5rem | section headers |
| `--text-h3` | 1.375rem → 1.75rem | card titles |
| `--text-body-lg` | 1.125rem → 1.25rem | lead paragraphs |
| `--text-body` | 1rem | default |
| `--text-sm` | 0.875rem | meta/captions |

Other: `--leading-tight` 1.1 (display), `--leading-normal` 1.6 (body),
`--tracking-tight` -0.02em (display), font-weights 400/500/600/700 only.

---

## 3. Spacing & layout

- Base spacing unit: 4px. Scale: `1,2,3,4,6,8,12,16,20,24,32` (×4px) → generous
  whitespace ([08_AWWWARDS_REFERENCES](../08_AWWWARDS_REFERENCES.txt)).
- Content max-width: `--container` = 1280px; wide editorial sections may go full-bleed.
- Section vertical rhythm: `--section-y` clamp 4rem → 8rem (spacious).
- Gutters: 16px (mobile) → 24px → 48px (desktop).

Breakpoints (Tailwind defaults, with intent):
| Name | Min | Intent |
|------|-----|--------|
| `sm` | 640 | large phone |
| `md` | 768 | tablet — **globe/video still fallback below `lg`** |
| `lg` | 1024 | desktop — globe/video enabled (capability-gated) |
| `xl` | 1280 | container cap |

---

## 4. Radius, border, elevation

| Token | Value |
|-------|-------|
| `--radius-sm` | 6px |
| `--radius-md` | 12px |
| `--radius-lg` | 20px (cards) |
| `--radius-pill` | 9999px |
| `--border-hairline` | 1px solid `rgba(17,17,17,0.08)` |
| `--shadow-soft` | low, diffuse (premium, not heavy) |
| `--shadow-card` | subtle lift on hover only |

Editorial style favors hairlines + whitespace over heavy shadows (avoid dashboard feel).

---

## 5. Motion tokens

Aligns with [14_ANIMATION_SYSTEM](../14_ANIMATION_SYSTEM.txt) and reduced-motion rules.

| Token | Value | Use |
|-------|-------|-----|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | UI transitions |
| `--ease-entrance` | `cubic-bezier(0.16, 1, 0.3, 1)` | reveals (expo-out feel) |
| `--dur-fast` | 150ms | hover/tap |
| `--dur-base` | 300ms | standard |
| `--dur-slow` | 600ms | reveals |
| `--dur-cinematic` | 900–1200ms | hero/scroll story beats |
| `--stagger` | 60–90ms | staggered reveals |

Rules: animation supports UX, never blocks interaction; all durations collapse toward 0 /
opacity-only under `prefers-reduced-motion`.

---

## 6. Z-index scale
| Token | Value | Use |
|-------|-------|-----|
| `--z-base` | 0 | content |
| `--z-globe` | 10 | globe canvas (behind content overlays) |
| `--z-header` | 50 | sticky nav |
| `--z-overlay` | 70 | scrims |
| `--z-modal` | 80 | auth modal / mobile menu |
| `--z-toast` | 90 | toasts |

---

## 7. Token governance
- Tokens are the **only** source of color/space/type/motion values; components never use
  raw hex or magic numbers (enforced in review per [15_CODE_STANDARDS](../15_CODE_STANDARDS.txt)).
- shadcn components are themed via these CSS variables so primitives match the editorial
  look rather than the default look.
- Dark sections opt in explicitly (a `data-theme="dark"` wrapper remaps text/surface tokens).
