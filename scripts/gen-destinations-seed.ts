import { writeFileSync } from "node:fs";
import { ALL_DESTINATIONS } from "@/constants/destinations";

const esc = (s: string) => s.replace(/'/g, "''");

const rows = ALL_DESTINATIONS.map(
  (d) =>
    `  ('${d.slug}', '${esc(d.name)}', '${esc(d.country)}', '${esc(d.region)}', '${esc(d.summary)}', ${d.coordinates.lat}, ${d.coordinates.lng}, ${d.dna.adventure}, ${d.dna.culture}, ${d.dna.food}, ${d.dna.nature}, ${d.dna.nightlife}, ${d.dna.budgetFriendly}, ${d.budget.accommodation}, ${d.budget.food}, ${d.budget.transport})`,
).join(",\n");

const sql = `-- =============================================================================
-- Seed ALL ${ALL_DESTINATIONS.length} destinations (Tier 1 + Tier 2) so every destination is saveable
-- to wishlists/itineraries. Idempotent: conflict on slug updates in place (existing
-- featured rows keep their id, so FKs from seed journals stay valid).
-- =============================================================================
insert into public.destinations
  (slug, name, country, region, summary, latitude, longitude,
   dna_adventure, dna_culture, dna_food, dna_nature, dna_nightlife, dna_budget_friendly,
   budget_accommodation, budget_food, budget_transport)
values
${rows}
on conflict (slug) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  summary = excluded.summary,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  dna_adventure = excluded.dna_adventure,
  dna_culture = excluded.dna_culture,
  dna_food = excluded.dna_food,
  dna_nature = excluded.dna_nature,
  dna_nightlife = excluded.dna_nightlife,
  dna_budget_friendly = excluded.dna_budget_friendly,
  budget_accommodation = excluded.budget_accommodation,
  budget_food = excluded.budget_food,
  budget_transport = excluded.budget_transport;
`;

writeFileSync(
  "supabase/migrations/20260621130000_seed_all_destinations.sql",
  sql,
);
console.log(`Wrote ${ALL_DESTINATIONS.length} destinations to migration file.`);
