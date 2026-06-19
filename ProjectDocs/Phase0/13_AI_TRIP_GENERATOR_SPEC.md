# 13 — AI Trip Generator Specification (Rule-Based)

Implements D4: **deterministic, rule-based engine — no LLM, no external AI, no API
keys.** It satisfies [07_COMPETITION_MODE](../07_COMPETITION_MODE.txt) "AI Trip
Generator" while remaining fully demonstrable and Product-Realistic.

Engine runs **client-side** (pure functions in `features/trip-generator/engine/`), is
re-run **server-side at save time** for integrity ([06_DATA_CONTRACTS](06_DATA_CONTRACTS.md)
TripSaveInput). Same input → same output (deterministic).

> **STATUS: OPTIONAL / DEFERRED (D4).** Per the updated
> [07_COMPETITION_MODE](../07_COMPETITION_MODE.txt) and
> [13_JUDGE_DEMO_FLOW](../13_JUDGE_DEMO_FLOW.txt), this feature is **not part of the
> judge demo flow** and is **not a release blocker**. It is built in **Phase 5 only if**
> the 7 core CRUD flows are complete and pass the CRUDR gate. This spec is kept ready so
> it can be implemented quickly when/if that condition is met. When built, it persists as
> a normal `itinerary` (`source = 'generated'`) and must itself pass CRUDR. See
> [ROADMAP](ROADMAP.md).

---

## 1. Inputs (TripGenerateInput)

| Input | Type | Range |
|-------|------|-------|
| `budget` | cents (USD) | $200 – $50,000 total trip budget |
| `days` | int | 1 – 14 |
| `style` | enum | adventure \| culture \| food \| nature \| luxury |
| `destinationSlug` | slug \| null | optional; if null, engine recommends one |

---

## 2. Data the engine consumes (from static dataset)

Per destination (from `constants/destinations.ts`, see
[07_MEDIA…](07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md) §5):
- Travel DNA: `{ adventure, culture, food, nature, nightlife, budgetFriendly }` (0–100).
- Daily budget baseline: `{ accommodation, food, transport }` (cents/day).
- An **activity pool**: a curated list of activities (existing hidden gems + nearby +
  notable attractions), each tagged:
  - `category`: one of the style dimensions (adventure/culture/food/nature/nightlife) +
    `relax`/`sightseeing` generic.
  - `cost`: cents (typical per-person), `partOfDay`: morning/afternoon/evening,
    `durationHours`.

> The activity pool is authored content (part of the static dataset). With ~10–14 tagged
> activities per destination, the engine can produce varied multi-day plans across the 5
> destinations without feeling repetitive.

---

## 3. Destination selection (when `destinationSlug` is null)

Score each destination for the chosen `style`, then pick the best affordable one.

```
styleAxis = map(style → DNA axis)              # food→food, luxury→(inverse budgetFriendly + culture), etc.
affinity   = weighted DNA match for style       # 0..100
afford     = how well daily baseline fits budget/days   # 0..1 (1 if comfortably within)
score      = 0.7 * (affinity/100) + 0.3 * afford
pick       = argmax(score); deterministic tie-break by slug order
```

Style → primary axis mapping:
| style | primary axis | secondary boosts |
|-------|--------------|------------------|
| adventure | adventure | nature |
| culture | culture | food |
| food | food | culture, nightlife |
| nature | nature | adventure |
| luxury | (100 − budgetFriendly) | culture, food |

If the user supplied `destinationSlug`, selection is skipped and that destination is used
(affordability still informs tier — §5).

---

## 4. Itinerary generation (day-by-day)

For the selected destination and `days`:

1. **Filter** the activity pool to the chosen `style` first, then fill remaining slots
   with high-value generic (`sightseeing`/`relax`) and secondary-axis activities.
2. **Per day** allocate up to 3 activities by `partOfDay` (morning, afternoon, evening),
   respecting `durationHours` so a day isn't overloaded.
3. **Anti-repetition / determinism:** iterate the filtered pool with a deterministic
   rotation seeded by `(slug, style, days)` so:
   - the same inputs always yield the same plan,
   - consecutive days don't repeat the same activity,
   - if `days` exceeds unique activities, the engine cycles with a varied offset and
     labels repeats as "revisit / alternative time" rather than literal duplicates.
4. Each generated day → `{ dayIndex, title, items: [{ title, startTime, cost, note, destinationSlug }] }`
   matching `itinerary_days` / `itinerary_items` shapes
   ([04_DATABASE_SCHEMA](04_DATABASE_SCHEMA.md)).

Day title pattern: e.g. "Day 2 · Culture & Cuisine" derived from that day's dominant
activity categories.

---

## 5. Budget estimation

```
baseDaily   = accommodation + food + transport       # from destination baseline (cents)
activityDaily = sum(costs of that day's activities)   # from pool
dayCost     = baseDaily + activityDaily
estTotal    = sum(dayCost over all days)
```

Reconcile against the user's `budget`:
- If `estTotal <= budget`: plan stands; surface remaining headroom ("≈ $X under budget").
- If `estTotal > budget`: engine **down-tiers** deterministically:
  1. drop the most expensive non-style activity per over-budget day,
  2. if still over, reduce to 2 activities/day,
  3. if still over, flag "budget is tight for N days here" with the realistic minimum.
- Never silently produce a plan that misrepresents cost; the estimate shown always equals
  the sum of displayed items + daily baseline (honest, demonstrable).

Output budget block: `{ accommodation, food, transport, activities, total, perDay, currency: 'USD', vsBudget }`.

---

## 6. Output (engine result)

```
{
  destination: { slug, name },
  style, days,
  itinerary: [ { dayIndex, title, items: [ItineraryItemDraft] } ],
  budget: { accommodation, food, transport, activities, total, perDay, vsBudget, currency },
  recommendedAttractions: [ top items surfaced as highlights ],
  notes: [ e.g. "Budget is tight — showing essentials only" ]
}
```

All money in cents; formatted at render.

---

## 7. Persistence (save flow)

On "Save" ([02_USER_AND_AUTH_FLOWS](02_USER_AND_AUTH_FLOWS.md) §5.4):
1. Auth gate if guest (intent replay).
2. Client submits `TripSaveInput`.
3. **Server re-runs the engine** with the original inputs and verifies the submitted plan
   matches (prevents arbitrary/injected items).
4. Persists in one transaction: `itineraries` (`source='generated'`, `style`,
   `destination_id`, `total_budget=estTotal`) + `itinerary_days` + `itinerary_items`.
5. Returns the new itinerary id → user lands on `/itineraries/[id]` and can edit it like
   any manual itinerary (now fully their content).

---

## 8. UX & honesty rules

- The "generating" state is a brief, real computation with a tasteful transition — **not
  fabricated latency** (Product Realism). Computation is instant; the animation is ≤ ~800ms
  and skippable / reduced under `prefers-reduced-motion`.
- It is presented as a **smart trip planner**, not as a large language model, to set
  honest expectations (no "AI magic" claims it can't back up).
- Invalid/empty inputs are blocked by validation; the engine never returns an empty plan.

---

## 9. Edge cases

| Case | Behavior |
|------|----------|
| `days` > unique activities | deterministic cycling with varied offsets + "revisit" labelling |
| budget far too low | minimal viable plan + honest "minimum needed ≈ $X" note |
| preferred destination + mismatched style | honor destination; reweight day activities toward style where pool allows |
| pool lacks style activities | fall back to secondary axis + generic, note the substitution |
| all 5 destinations unaffordable for inputs | recommend the cheapest + show the realistic minimum days/budget |

---

## 10. Determinism & testability

- Pure functions; no `Date.now()`, no `Math.random()` (any rotation uses a seed derived
  from inputs).
- Same input ⇒ byte-identical output ⇒ server save-time verification is exact.
- Unit-testable in isolation; covered by tests in Phase 4 and exercised by the Phase 5
  judge-flow e2e (step 6).
