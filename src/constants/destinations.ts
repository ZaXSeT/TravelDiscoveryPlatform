import type {
  Destination,
  DestinationSummary,
  ExploreDestination,
} from "@/types";
import { destinationImageId, galleryIds } from "@/constants/assets";

// Static, seeded destinations (D1). Values mirror supabase/seed.sql so the rendered
// pages and the DB rows never drift (same slug + same numbers). Budget = cents/day USD.

const media = (slug: string) => ({
  hero: destinationImageId(slug, "hero"),
  thumbnail: destinationImageId(slug, "thumbnail"),
  videoPoster: destinationImageId(slug, "videoPoster"),
  gallery: galleryIds(slug),
});

export const DESTINATIONS: Destination[] = [
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    summary:
      "Lush rice terraces, surf breaks, and temple-dotted hills — an island built for slow, soulful travel.",
    description:
      "Bali pairs spiritual calm with everyday adventure. Mornings begin in the misted rice terraces of Ubud, afternoons drift toward Canggu's surf, and evenings end with temple bells over the cliffs of Uluwatu. It rewards travelers who slow down.",
    coordinates: { lat: -8.4095, lng: 115.1889 },
    dna: { adventure: 70, culture: 75, food: 80, nature: 85, nightlife: 60, budgetFriendly: 85 },
    budget: { accommodation: 4000, food: 1500, transport: 1000 },
    travelTips: [
      "Rent a scooter for the hills, but hire a driver for long cross-island days.",
      "Carry a sarong — many temples require covered legs to enter.",
      "Visit popular temples at sunrise to beat both heat and crowds.",
    ],
    hiddenGems: [
      {
        title: "Sidemen Valley",
        description: "Ubud's quieter cousin — emerald terraces without the tour buses.",
        image: "go/destinations/bali/gem-sidemen",
      },
      {
        title: "Nusa Penida Cliffs",
        description: "A short boat ride to some of the island's most dramatic coastline.",
        image: "go/destinations/bali/gem-penida",
      },
    ],
    nearby: [
      { name: "Tegallalang Rice Terraces", distanceKm: 9, image: "go/destinations/bali/near-tegallalang" },
      { name: "Uluwatu Temple", distanceKm: 32, image: "go/destinations/bali/near-uluwatu" },
      { name: "Mount Batur", distanceKm: 47, image: "go/destinations/bali/near-batur" },
    ],
    media: media("bali"),
    categories: ["Beach", "Nature", "Wellness", "Budget"],
    bestSeason: "April – October (dry season)",
  },
  {
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    summary:
      "Neon-lit precision meets centuries-old ritual — the world's most electric culinary capital.",
    description:
      "Tokyo runs on contrast: a hush at a shrine one block, a wall of light in Shinjuku the next. It is a city to eat your way through, from basement department-store delicacies to seven-seat counters down unmarked stairs.",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    dna: { adventure: 55, culture: 95, food: 98, nature: 50, nightlife: 85, budgetFriendly: 40 },
    budget: { accommodation: 9000, food: 3500, transport: 1200 },
    travelTips: [
      "Get a rechargeable Suica/Pasmo card — it works on nearly every train and many shops.",
      "Cash still matters; carry some for small restaurants and shrines.",
      "Last trains run around midnight — plan your night out around them.",
    ],
    hiddenGems: [
      {
        title: "Yanaka Old Town",
        description: "A low-rise neighborhood of temples, cats, and pre-war streets.",
        image: "go/destinations/tokyo/gem-yanaka",
      },
      {
        title: "Omoide Yokocho",
        description: "Lantern-lit alleys of tiny yakitori counters near Shinjuku.",
        image: "go/destinations/tokyo/gem-omoide",
      },
    ],
    nearby: [
      { name: "Senso-ji Temple", distanceKm: 6, image: "go/destinations/tokyo/near-sensoji" },
      { name: "Meiji Jingu", distanceKm: 8, image: "go/destinations/tokyo/near-meiji" },
      { name: "teamLab Planets", distanceKm: 10, image: "go/destinations/tokyo/near-teamlab" },
    ],
    media: media("tokyo"),
    categories: ["City", "Food", "Culture", "Nightlife"],
    bestSeason: "March – May & October – November",
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    summary:
      "Boulevards, ateliers, and patisseries — an open-air museum of art, fashion, and food.",
    description:
      "Paris is best walked. Market mornings in the Marais, long café afternoons, and the slow gold of evening on the Seine. The headline sights are worth it, but the city's real pleasure is its unhurried everyday rhythm.",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    dna: { adventure: 45, culture: 98, food: 95, nature: 40, nightlife: 75, budgetFriendly: 35 },
    budget: { accommodation: 11000, food: 4000, transport: 1500 },
    travelTips: [
      "Many museums are free on the first Sunday of the month — go early.",
      "A carnet of metro tickets (or a Navigo pass) beats buying singles.",
      "Lunch menus (formule) are the best value at otherwise pricey restaurants.",
    ],
    hiddenGems: [
      {
        title: "Canal Saint-Martin",
        description: "Iron footbridges, indie cafés, and a local Sunday picnic scene.",
        image: "go/destinations/paris/gem-canal",
      },
      {
        title: "Promenade Plantée",
        description: "An elevated garden walk built on an old railway viaduct.",
        image: "go/destinations/paris/gem-promenade",
      },
    ],
    nearby: [
      { name: "Louvre Museum", distanceKm: 2, image: "go/destinations/paris/near-louvre" },
      { name: "Musée d'Orsay", distanceKm: 3, image: "go/destinations/paris/near-orsay" },
      { name: "Palace of Versailles", distanceKm: 20, image: "go/destinations/paris/near-versailles" },
    ],
    media: media("paris"),
    categories: ["City", "Culture", "Food", "Romance"],
    bestSeason: "April – June & September – October",
  },
  {
    slug: "new-york",
    name: "New York",
    country: "United States",
    region: "North America",
    summary:
      "A city of relentless reinvention — skyline, stages, and a restaurant for every craving.",
    description:
      "New York compresses the world into a grid. Gallery mornings downtown, a slice eaten standing up, a Broadway curtain at night, and a skyline that never quite lets you sleep. Every neighborhood is its own country.",
    coordinates: { lat: 40.7128, lng: -74.006 },
    dna: { adventure: 60, culture: 90, food: 92, nature: 35, nightlife: 95, budgetFriendly: 25 },
    budget: { accommodation: 15000, food: 5000, transport: 1500 },
    travelTips: [
      "An unlimited MetroCard/OMNY pays off fast if you ride more than a few times a day.",
      "Lunch in Midtown, dinner in the outer boroughs — better food, lower prices.",
      "Many museums are 'pay what you wish' for NY State residents; check entry rules.",
    ],
    hiddenGems: [
      {
        title: "The Cloisters",
        description: "A medieval monastery transplanted to a quiet park uptown.",
        image: "go/destinations/new-york/gem-cloisters",
      },
      {
        title: "Roosevelt Island Tram",
        description: "A cheap aerial commute with the city's best free skyline view.",
        image: "go/destinations/new-york/gem-tram",
      },
    ],
    nearby: [
      { name: "Central Park", distanceKm: 4, image: "go/destinations/new-york/near-central-park" },
      { name: "The High Line", distanceKm: 3, image: "go/destinations/new-york/near-highline" },
      { name: "Brooklyn Bridge", distanceKm: 5, image: "go/destinations/new-york/near-brooklyn-bridge" },
    ],
    media: media("new-york"),
    categories: ["City", "Food", "Nightlife", "Culture"],
    bestSeason: "April – June & September – early December",
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    region: "Europe",
    summary:
      "Alpine cinema in every direction — glacial lakes, peak railways, and pristine mountain air.",
    description:
      "Switzerland is engineered for wonder: trains that climb into the clouds, lakes the color of glass, and trails that open onto impossible valleys. Slow, scenic, and spotless — it rewards travelers who look up.",
    coordinates: { lat: 46.8182, lng: 8.2275 },
    dna: { adventure: 95, culture: 70, food: 75, nature: 99, nightlife: 45, budgetFriendly: 20 },
    budget: { accommodation: 13000, food: 4500, transport: 2000 },
    travelTips: [
      "A Swiss Travel Pass can cover trains, boats, and many cable cars — do the math first.",
      "Mountain weather turns fast; pack layers even on clear summer days.",
      "Supermarket picnics keep food costs sane in an expensive country.",
    ],
    hiddenGems: [
      {
        title: "Lauterbrunnen Valley",
        description: "A cliff-walled valley of 72 waterfalls beneath the Jungfrau.",
        image: "go/destinations/switzerland/gem-lauterbrunnen",
      },
      {
        title: "Oeschinen Lake",
        description: "A turquoise alpine lake reached by gondola and a short walk.",
        image: "go/destinations/switzerland/gem-oeschinen",
      },
    ],
    nearby: [
      { name: "Jungfraujoch", distanceKm: 20, image: "go/destinations/switzerland/near-jungfrau" },
      { name: "Lake Lucerne", distanceKm: 35, image: "go/destinations/switzerland/near-lucerne" },
      { name: "Matterhorn (Zermatt)", distanceKm: 90, image: "go/destinations/switzerland/near-matterhorn" },
    ],
    media: media("switzerland"),
    categories: ["Mountains", "Nature", "Adventure", "Scenic"],
    bestSeason: "June – September (hiking) · December – March (snow)",
  },
];

export const DESTINATION_SLUGS = DESTINATIONS.map((d) => d.slug);

export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

export function toSummary(d: Destination): DestinationSummary {
  return {
    slug: d.slug,
    name: d.name,
    country: d.country,
    region: d.region,
    summary: d.summary,
    thumbnail: d.media.thumbnail,
    categories: d.categories,
  };
}

export function getRelated(slug: string, limit = 3): DestinationSummary[] {
  const current = getDestination(slug);
  if (!current) return [];
  // Prefer same region, then fill with others; stable order.
  const others = DESTINATIONS.filter((d) => d.slug !== slug);
  const sameRegion = others.filter((d) => d.region === current.region);
  const rest = others.filter((d) => d.region !== current.region);
  return [...sameRegion, ...rest].slice(0, limit).map(toSummary);
}

export const FEATURED_SLUGS = ["bali", "tokyo", "switzerland"];

export function getFeatured(): DestinationSummary[] {
  return FEATURED_SLUGS.map(getDestination)
    .filter((d): d is Destination => Boolean(d))
    .map(toSummary);
}

// =============================================================================
// TIER 2 — EXPLORE DESTINATIONS (lightweight, frontend-only)
// Thumbnail/hero ids resolve through the image resolver (Cloudinary in prod, a
// varied placeholder pool in dev). budgetPerDay is integer cents/day (USD).
// =============================================================================

const ex = (
  d: Omit<ExploreDestination, "thumbnail" | "hero">,
): ExploreDestination => ({
  ...d,
  thumbnail: `go/destinations/${d.slug}/thumbnail`,
  hero: `go/destinations/${d.slug}/hero`,
});

export const EXPLORE_DESTINATIONS: ExploreDestination[] = [
  // --- Asia ---
  ex({ slug: "kyoto", name: "Kyoto", country: "Japan", region: "Asia", summary: "Temple gardens, geisha districts, and centuries of refined tradition.", coordinates: { lat: 35.0116, lng: 135.7681 }, categories: ["City", "Culture", "Food"], bestSeason: "Mar–May & Oct–Nov", budgetPerDay: 9000 }),
  ex({ slug: "seoul", name: "Seoul", country: "South Korea", region: "Asia", summary: "Hyper-modern energy, palace courtyards, and late-night street food.", coordinates: { lat: 37.5665, lng: 126.978 }, categories: ["City", "Food", "Culture"], bestSeason: "Apr–Jun & Sep–Nov", budgetPerDay: 8000 }),
  ex({ slug: "bangkok", name: "Bangkok", country: "Thailand", region: "Asia", summary: "Golden temples, canal markets, and the world's best street eats.", coordinates: { lat: 13.7563, lng: 100.5018 }, categories: ["City", "Food", "Culture"], bestSeason: "Nov–Feb", budgetPerDay: 4500 }),
  ex({ slug: "singapore", name: "Singapore", country: "Singapore", region: "Asia", summary: "A garden city of futuristic skylines and hawker-stall flavor.", coordinates: { lat: 1.3521, lng: 103.8198 }, categories: ["City", "Food", "Luxury"], bestSeason: "Feb–Apr", budgetPerDay: 11000 }),
  ex({ slug: "hanoi", name: "Hanoi", country: "Vietnam", region: "Asia", summary: "Old-quarter lanes, lakeside calm, and unforgettable pho.", coordinates: { lat: 21.0278, lng: 105.8342 }, categories: ["City", "Culture", "Food"], bestSeason: "Oct–Dec", budgetPerDay: 3500 }),
  // --- Europe ---
  ex({ slug: "rome", name: "Rome", country: "Italy", region: "Europe", summary: "An open-air museum of ruins, piazzas, and perfect pasta.", coordinates: { lat: 41.9028, lng: 12.4964 }, categories: ["City", "Culture", "Food"], bestSeason: "Apr–Jun & Sep–Oct", budgetPerDay: 9500 }),
  ex({ slug: "amsterdam", name: "Amsterdam", country: "Netherlands", region: "Europe", summary: "Canal rings, world-class museums, and a bicycle's pace of life.", coordinates: { lat: 52.3676, lng: 4.9041 }, categories: ["City", "Culture"], bestSeason: "Apr–May & Sep", budgetPerDay: 11000 }),
  ex({ slug: "barcelona", name: "Barcelona", country: "Spain", region: "Europe", summary: "Gaudí fantasy, tapas crawls, and Mediterranean beaches.", coordinates: { lat: 41.3851, lng: 2.1734 }, categories: ["City", "Beach", "Food"], bestSeason: "May–Jun & Sep", budgetPerDay: 9000 }),
  ex({ slug: "prague", name: "Prague", country: "Czechia", region: "Europe", summary: "Fairytale spires, cobbled lanes, and riverside beer gardens.", coordinates: { lat: 50.0755, lng: 14.4378 }, categories: ["City", "Culture"], bestSeason: "May–Sep", budgetPerDay: 6000 }),
  ex({ slug: "vienna", name: "Vienna", country: "Austria", region: "Europe", summary: "Imperial palaces, coffee houses, and effortless old-world elegance.", coordinates: { lat: 48.2082, lng: 16.3738 }, categories: ["City", "Culture", "Luxury"], bestSeason: "Apr–May & Sep–Oct", budgetPerDay: 9000 }),
  // --- North America ---
  ex({ slug: "san-francisco", name: "San Francisco", country: "United States", region: "North America", summary: "Fog-wrapped hills, the Golden Gate, and a serious food scene.", coordinates: { lat: 37.7749, lng: -122.4194 }, categories: ["City", "Nature", "Food"], bestSeason: "Sep–Nov", budgetPerDay: 15000 }),
  ex({ slug: "vancouver", name: "Vancouver", country: "Canada", region: "North America", summary: "Where rainforest, ocean, and mountains meet a glass skyline.", coordinates: { lat: 49.2827, lng: -123.1207 }, categories: ["City", "Nature", "Adventure"], bestSeason: "Jun–Sep", budgetPerDay: 12000 }),
  ex({ slug: "toronto", name: "Toronto", country: "Canada", region: "North America", summary: "Canada's most diverse city — neighborhoods, galleries, and food.", coordinates: { lat: 43.6532, lng: -79.3832 }, categories: ["City", "Culture", "Food"], bestSeason: "May–Oct", budgetPerDay: 11000 }),
  ex({ slug: "chicago", name: "Chicago", country: "United States", region: "North America", summary: "Bold architecture, lakefront beaches, and deep-dish everything.", coordinates: { lat: 41.8781, lng: -87.6298 }, categories: ["City", "Culture", "Food"], bestSeason: "May–Oct", budgetPerDay: 11000 }),
  // --- Oceania ---
  ex({ slug: "sydney", name: "Sydney", country: "Australia", region: "Oceania", summary: "Iconic harbor, golden beaches, and an easy outdoor lifestyle.", coordinates: { lat: -33.8688, lng: 151.2093 }, categories: ["City", "Beach", "Nature"], bestSeason: "Sep–Nov & Mar–May", budgetPerDay: 12000 }),
  ex({ slug: "melbourne", name: "Melbourne", country: "Australia", region: "Oceania", summary: "Laneway cafés, street art, and Australia's culture capital.", coordinates: { lat: -37.8136, lng: 144.9631 }, categories: ["City", "Culture", "Food"], bestSeason: "Mar–May & Sep–Nov", budgetPerDay: 11000 }),
  ex({ slug: "queenstown", name: "Queenstown", country: "New Zealand", region: "Oceania", summary: "The adventure capital — alpine lakes, peaks, and adrenaline.", coordinates: { lat: -45.0312, lng: 168.6626 }, categories: ["Nature", "Adventure"], bestSeason: "Dec–Feb & Jun–Aug", budgetPerDay: 13000 }),
  // --- Middle East ---
  ex({ slug: "dubai", name: "Dubai", country: "United Arab Emirates", region: "Middle East", summary: "Desert futurism — record-breaking towers, malls, and beaches.", coordinates: { lat: 25.2048, lng: 55.2708 }, categories: ["City", "Luxury", "Beach"], bestSeason: "Nov–Mar", budgetPerDay: 16000 }),
  ex({ slug: "istanbul", name: "Istanbul", country: "Türkiye", region: "Middle East", summary: "Two continents, grand bazaars, and Byzantine-Ottoman splendor.", coordinates: { lat: 41.0082, lng: 28.9784 }, categories: ["City", "Culture", "Food"], bestSeason: "Apr–May & Sep–Nov", budgetPerDay: 6000 }),
  // --- Africa ---
  ex({ slug: "cape-town", name: "Cape Town", country: "South Africa", region: "Africa", summary: "Table Mountain, wine country, and dramatic coastal drives.", coordinates: { lat: -33.9249, lng: 18.4241 }, categories: ["Nature", "Beach", "Adventure"], bestSeason: "Nov–Mar", budgetPerDay: 9000 }),
  ex({ slug: "marrakech", name: "Marrakech", country: "Morocco", region: "Africa", summary: "Souk mazes, riad courtyards, and the edge of the Sahara.", coordinates: { lat: 31.6295, lng: -7.9811 }, categories: ["Culture", "Adventure", "Luxury"], bestSeason: "Mar–May & Sep–Nov", budgetPerDay: 6000 }),
];

export function getExploreDestination(
  slug: string,
): ExploreDestination | undefined {
  return EXPLORE_DESTINATIONS.find((d) => d.slug === slug);
}

export function exploreToSummary(d: ExploreDestination): DestinationSummary {
  return {
    slug: d.slug,
    name: d.name,
    country: d.country,
    region: d.region,
    summary: d.summary,
    thumbnail: d.thumbnail,
    categories: d.categories,
  };
}

/** All destination objects (both tiers) — for deriving facets. */
export const ALL_DESTINATIONS: Array<Destination | ExploreDestination> = [
  ...DESTINATIONS,
  ...EXPLORE_DESTINATIONS,
];

/** Every slug that has a detail page (Tier 1 + Tier 2). */
export const ALL_DESTINATION_SLUGS = [
  ...DESTINATION_SLUGS,
  ...EXPLORE_DESTINATIONS.map((d) => d.slug),
];

/** Per-day budget in cents for any tier (featured = sum of breakdown). */
export function budgetPerDayFor(d: Destination | ExploreDestination): number {
  return "budget" in d
    ? d.budget.accommodation + d.budget.food + d.budget.transport
    : d.budgetPerDay;
}
