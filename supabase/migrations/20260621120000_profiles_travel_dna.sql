-- Travel DNA Assessment: persist the user's computed Travel DNA profile (6 axes, 0–100)
-- as JSON on their profile so it can be reused for itinerary generation.
alter table public.profiles
  add column if not exists travel_dna jsonb;
