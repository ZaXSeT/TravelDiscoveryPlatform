import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const journals = [
  {
    id: "10000000-0000-4000-8000-000000000004",
    user_id: null,
    is_seed: true,
    author_label: "GO Editorial",
    slug: "winter-in-new-york",
    title: "Winter in New York",
    excerpt: "Ice skating, holiday lights, and the relentless energy of a city that never stops moving.",
    body: "## The Cold Rush\nThe air bites, but the city glows. A walk through Central Park under fresh snow.\n\n## Warm Refuges\nDucking into corner diners and world-class museums to escape the chill.",
    cover_path: "go/destinations/new-york/hero",
    destination_id: "44444444-4444-4444-8444-444444444444",
    visibility: "public",
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    user_id: null,
    is_seed: true,
    author_label: "GO Editorial",
    slug: "alpine-trains",
    title: "Crossing the Swiss Alps",
    excerpt: "A visual journey aboard the Glacier Express, winding through some of Europe's most dramatic peaks.",
    body: "## The Ascent\nLeaving the valley behind, the train slowly climbs into the clouds.\n\n## Glacial Views\nUninterrupted white landscapes stretch out as we cross the high passes.",
    cover_path: "go/destinations/switzerland/hero",
    destination_id: "55555555-5555-4555-8555-555555555555",
    visibility: "public",
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    user_id: null,
    is_seed: true,
    author_label: "GO Editorial",
    slug: "canggu-nomad-diaries",
    title: "Canggu Nomad Diaries",
    excerpt: "Finding balance between late-night coding sessions and early-morning surf breaks.",
    body: "## Work and Waves\nThe rhythm of life here is simple: code, surf, eat, repeat.\n\n## Community\nMeeting creatives from every corner of the globe at sunset.",
    cover_path: "go/destinations/bali/gallery-1",
    destination_id: "11111111-1111-4111-8111-111111111111",
    visibility: "public",
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function run() {
  const { data, error } = await supabase.from("journals").upsert(journals);
  if (error) {
    console.error("Error inserting journals:", error);
    process.exit(1);
  }
  console.log("Successfully inserted journals");
}

run();
