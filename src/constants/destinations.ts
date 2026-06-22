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
      "Lush rice terraces, surf breaks, and temple-dotted hills. An island built for slow, soulful travel.",
    description:
      "Bali pairs spiritual calm with everyday adventure. Mornings begin in the misted rice terraces of Ubud, afternoons drift toward Canggu's surf, and evenings end with temple bells over the cliffs of Uluwatu. It rewards travelers who slow down.",
    coordinates: { lat: -8.4095, lng: 115.1889 },
    dna: { adventure: 70, culture: 75, food: 80, nature: 85, nightlife: 60, budgetFriendly: 85 },
    budget: { accommodation: 4000, food: 1500, transport: 1000 },
    travelTips: [
      "Rent a scooter for the hills, but hire a driver for long cross-island days.",
      "Carry a sarong, as many temples require covered legs to enter.",
      "Visit popular temples at sunrise to beat both heat and crowds.",
    ],
    hiddenGems: [
      {
        title: "Sidemen Valley",
        description: "Ubud's quieter cousin with emerald terraces without the tour buses.",
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
      "Neon-lit precision meets centuries-old ritual in the world's most electric culinary capital.",
    description:
      "Tokyo runs on contrast: a hush at a shrine one block, a wall of light in Shinjuku the next. It is a city to eat your way through, from basement department-store delicacies to seven-seat counters down unmarked stairs.",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    dna: { adventure: 55, culture: 95, food: 98, nature: 50, nightlife: 85, budgetFriendly: 40 },
    budget: { accommodation: 9000, food: 3500, transport: 1200 },
    travelTips: [
      "Get a rechargeable Suica/Pasmo card. It works on nearly every train and many shops.",
      "Cash still matters; carry some for small restaurants and shrines.",
      "Last trains run around midnight, so plan your night out around them.",
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
      "Boulevards, ateliers, and patisseries. An open-air museum of art, fashion, and food.",
    description:
      "Paris is best walked. Market mornings in the Marais, long café afternoons, and the slow gold of evening on the Seine. The headline sights are worth it, but the city's real pleasure is its unhurried everyday rhythm.",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    dna: { adventure: 45, culture: 98, food: 95, nature: 40, nightlife: 75, budgetFriendly: 35 },
    budget: { accommodation: 11000, food: 4000, transport: 1500 },
    travelTips: [
      "Many museums are free on the first Sunday of the month, so go early.",
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
      "A city of relentless reinvention with a skyline, stages, and a restaurant for every craving.",
    description:
      "New York compresses the world into a grid. Gallery mornings downtown, a slice eaten standing up, a Broadway curtain at night, and a skyline that never quite lets you sleep. Every neighborhood is its own country.",
    coordinates: { lat: 40.7128, lng: -74.006 },
    dna: { adventure: 60, culture: 90, food: 92, nature: 35, nightlife: 95, budgetFriendly: 25 },
    budget: { accommodation: 15000, food: 5000, transport: 1500 },
    travelTips: [
      "An unlimited MetroCard/OMNY pays off fast if you ride more than a few times a day.",
      "Lunch in Midtown, dinner in the outer boroughs. Better food and lower prices.",
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
      "Alpine cinema in every direction with glacial lakes, peak railways, and pristine mountain air.",
    description:
      "Switzerland is engineered for wonder: trains that climb into the clouds, lakes the color of glass, and trails that open onto impossible valleys. Slow, scenic, and spotless. It rewards travelers who look up.",
    coordinates: { lat: 46.8182, lng: 8.2275 },
    dna: { adventure: 95, culture: 70, food: 75, nature: 99, nightlife: 45, budgetFriendly: 20 },
    budget: { accommodation: 13000, food: 4500, transport: 2000 },
    travelTips: [
      "A Swiss Travel Pass can cover trains, boats, and many cable cars - do the math first.",
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
  const current = ALL_DESTINATIONS.find((d) => d.slug === slug);
  if (!current) return [];
  const others = ALL_DESTINATIONS.filter((d) => d.slug !== slug);
  const sameRegion = others.filter((d) => d.region === current.region);
  const rest = others.filter((d) => d.region !== current.region);
  return [...sameRegion, ...rest].slice(0, limit).map(toSummary);
}

export const FEATURED_SLUGS = ["bali", "tokyo", "switzerland"];

export function getFeatured(): DestinationSummary[] {
  return FEATURED_SLUGS.map((s) => ALL_DESTINATIONS.find((d) => d.slug === s))
    .filter((d): d is Destination => Boolean(d))
    .map(toSummary);
}

// =============================================================================
// TIER 2 - EXPLORE DESTINATIONS (now full Destination objects)
// =============================================================================

export const EXPLORE_DESTINATIONS: Destination[] = [

  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    summary: "Temple gardens, geisha districts, and centuries of refined tradition.",
    description: "Kyoto is a vibrant destination blending city, culture, food. Temple gardens, geisha districts, and centuries of refined tradition. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Japan.",
    coordinates: {"lat":35.0116,"lng":135.7681},
    dna: { adventure: 61, culture: 54, food: 79, nature: 74, nightlife: 86, budgetFriendly: 35 },
    budget: { accommodation: 4500, food: 2700, transport: 1800 },
    travelTips: ["Rent a bicycle to avoid the crowded buses.","Visit Arashiyama at dawn to escape the crowds."],
    hiddenGems: [
      { title: "Otagi Nenbutsu-ji", description: "1,200 whimsical stone statues.", image: "go/destinations/kyoto/gem1" },
      { title: "Pontocho Alley", description: "A narrow dining alley.", image: "go/destinations/kyoto/gem2" }
    ],
    nearby: [
      { name: "Nara", distanceKm: 45, image: "go/destinations/kyoto/near1" },
      { name: "Osaka", distanceKm: 55, image: "go/destinations/kyoto/near2" },
      { name: "Kobe", distanceKm: 70, image: "go/destinations/kyoto/near3" }
    ],
    media: media("kyoto"),
    categories: ["City","Culture","Food"],
    bestSeason: "Mar–May & Oct–Nov"
  },
  {
    slug: "seoul",
    name: "Seoul",
    country: "South Korea",
    region: "Asia",
    summary: "Hyper-modern energy, palace courtyards, and late-night street food.",
    description: "Seoul is a vibrant destination blending city, food, culture. Hyper-modern energy, palace courtyards, and late-night street food. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in South Korea.",
    coordinates: {"lat":37.5665,"lng":126.978},
    dna: { adventure: 68, culture: 54, food: 60, nature: 34, nightlife: 74, budgetFriendly: 35 },
    budget: { accommodation: 4000, food: 2400, transport: 1600 },
    travelTips: ["Get a T-money card for seamless transit.","Try the street food in Myeongdong."],
    hiddenGems: [
      { title: "Ihwa Mural Village", description: "Street art in a hillside neighborhood.", image: "go/destinations/seoul/gem1" },
      { title: "Ikseon-dong", description: "Traditional hanoks turned into cafes.", image: "go/destinations/seoul/gem2" }
    ],
    nearby: [
      { name: "Nami Island", distanceKm: 60, image: "go/destinations/seoul/near1" },
      { name: "Suwon", distanceKm: 30, image: "go/destinations/seoul/near2" },
      { name: "DMZ", distanceKm: 50, image: "go/destinations/seoul/near3" }
    ],
    media: media("seoul"),
    categories: ["City","Food","Culture"],
    bestSeason: "Apr–Jun & Sep–Nov"
  },
  {
    slug: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    region: "Asia",
    summary: "Golden temples, canal markets, and the world's best street eats.",
    description: "Bangkok is a vibrant destination blending city, food, culture. Golden temples, canal markets, and the world's best street eats. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Thailand.",
    coordinates: {"lat":13.7563,"lng":100.5018},
    dna: { adventure: 65, culture: 69, food: 54, nature: 47, nightlife: 49, budgetFriendly: 85 },
    budget: { accommodation: 2250, food: 1350, transport: 900 },
    travelTips: ["Use the BTS Skytrain to avoid gridlock traffic.","Bargain politely at the night markets."],
    hiddenGems: [
      { title: "Bang Krachao", description: "The Green Lung of Bangkok.", image: "go/destinations/bangkok/gem1" },
      { title: "Talad Noi", description: "Historic neighborhood with street art.", image: "go/destinations/bangkok/gem2" }
    ],
    nearby: [
      { name: "Ayutthaya", distanceKm: 80, image: "go/destinations/bangkok/near1" },
      { name: "Pattaya", distanceKm: 150, image: "go/destinations/bangkok/near2" },
      { name: "Hua Hin", distanceKm: 200, image: "go/destinations/bangkok/near3" }
    ],
    media: media("bangkok"),
    categories: ["City","Food","Culture"],
    bestSeason: "Nov–Feb"
  },
  {
    slug: "singapore",
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    summary: "A garden city of futuristic skylines and hawker-stall flavor.",
    description: "Singapore is a vibrant destination blending city, food, luxury. A garden city of futuristic skylines and hawker-stall flavor. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Singapore.",
    coordinates: {"lat":1.3521,"lng":103.8198},
    dna: { adventure: 75, culture: 83, food: 54, nature: 52, nightlife: 83, budgetFriendly: 35 },
    budget: { accommodation: 5500, food: 3300, transport: 2200 },
    travelTips: ["Drink tap water; it is perfectly safe.","Use the MRT, it connects almost everywhere."],
    hiddenGems: [
      { title: "Pulau Ubin", description: "A rustic island frozen in time.", image: "go/destinations/singapore/gem1" },
      { title: "MacRitchie Reservoir", description: "Nature trails and a treetop walk.", image: "go/destinations/singapore/gem2" }
    ],
    nearby: [
      { name: "Sentosa", distanceKm: 5, image: "go/destinations/singapore/near1" },
      { name: "Johor Bahru", distanceKm: 25, image: "go/destinations/singapore/near2" },
      { name: "Batam", distanceKm: 30, image: "go/destinations/singapore/near3" }
    ],
    media: media("singapore"),
    categories: ["City","Food","Luxury"],
    bestSeason: "Feb–Apr"
  },
  {
    slug: "hanoi",
    name: "Hanoi",
    country: "Vietnam",
    region: "Asia",
    summary: "Old-quarter lanes, lakeside calm, and unforgettable pho.",
    description: "Hanoi is a vibrant destination blending city, culture, food. Old-quarter lanes, lakeside calm, and unforgettable pho. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Vietnam.",
    coordinates: {"lat":21.0278,"lng":105.8342},
    dna: { adventure: 53, culture: 62, food: 60, nature: 42, nightlife: 79, budgetFriendly: 85 },
    budget: { accommodation: 1750, food: 1050, transport: 700 },
    travelTips: ["Cross the street steadily; do not run.","Try egg coffee in the Old Quarter."],
    hiddenGems: [
      { title: "Train Street", description: "Cafes inches away from passing trains.", image: "go/destinations/hanoi/gem1" },
      { title: "Long Bien Bridge", description: "Historic bridge designed by Eiffel.", image: "go/destinations/hanoi/gem2" }
    ],
    nearby: [
      { name: "Halong Bay", distanceKm: 160, image: "go/destinations/hanoi/near1" },
      { name: "Ninh Binh", distanceKm: 90, image: "go/destinations/hanoi/near2" },
      { name: "Sapa", distanceKm: 315, image: "go/destinations/hanoi/near3" }
    ],
    media: media("hanoi"),
    categories: ["City","Culture","Food"],
    bestSeason: "Oct–Dec"
  },
  {
    slug: "rome",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    summary: "An open-air museum of ruins, piazzas, and perfect pasta.",
    description: "Rome is a vibrant destination blending city, culture, food. An open-air museum of ruins, piazzas, and perfect pasta. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Italy.",
    coordinates: {"lat":41.9028,"lng":12.4964},
    dna: { adventure: 71, culture: 87, food: 70, nature: 64, nightlife: 68, budgetFriendly: 35 },
    budget: { accommodation: 4750, food: 2850, transport: 1900 },
    travelTips: ["Carry a water bottle to refill at public fountains.","Book Colosseum tickets well in advance."],
    hiddenGems: [
      { title: "Appian Way", description: "Ancient Roman road perfect for biking.", image: "go/destinations/rome/gem1" },
      { title: "Aventine Keyhole", description: "A secret view of St. Peters dome.", image: "go/destinations/rome/gem2" }
    ],
    nearby: [
      { name: "Tivoli", distanceKm: 30, image: "go/destinations/rome/near1" },
      { name: "Naples", distanceKm: 225, image: "go/destinations/rome/near2" },
      { name: "Florence", distanceKm: 270, image: "go/destinations/rome/near3" }
    ],
    media: media("rome"),
    categories: ["City","Culture","Food"],
    bestSeason: "Apr–Jun & Sep–Oct"
  },
  {
    slug: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    summary: "Canal rings, world-class museums, and a bicycle's pace of life.",
    description: "Amsterdam is a vibrant destination blending city, culture. Canal rings, world-class museums, and a bicycle's pace of life. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Netherlands.",
    coordinates: {"lat":52.3676,"lng":4.9041},
    dna: { adventure: 78, culture: 55, food: 74, nature: 65, nightlife: 46, budgetFriendly: 35 },
    budget: { accommodation: 5500, food: 3300, transport: 2200 },
    travelTips: ["Watch out for bicycles, they have the right of way.","Book museum tickets online to skip lines."],
    hiddenGems: [
      { title: "Begijnhof", description: "A hidden courtyard in the city center.", image: "go/destinations/amsterdam/gem1" },
      { title: "NDSM Wharf", description: "A vibrant arts community in a former shipyard.", image: "go/destinations/amsterdam/gem2" }
    ],
    nearby: [
      { name: "Zaanse Schans", distanceKm: 20, image: "go/destinations/amsterdam/near1" },
      { name: "Keukenhof", distanceKm: 40, image: "go/destinations/amsterdam/near2" },
      { name: "Utrecht", distanceKm: 45, image: "go/destinations/amsterdam/near3" }
    ],
    media: media("amsterdam"),
    categories: ["City","Culture"],
    bestSeason: "Apr–May & Sep"
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    summary: "Gaudí fantasy, tapas crawls, and Mediterranean beaches.",
    description: "Barcelona is a vibrant destination blending city, beach, food. Gaudí fantasy, tapas crawls, and Mediterranean beaches. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Spain.",
    coordinates: {"lat":41.3851,"lng":2.1734},
    dna: { adventure: 56, culture: 77, food: 66, nature: 42, nightlife: 79, budgetFriendly: 35 },
    budget: { accommodation: 4500, food: 2700, transport: 1800 },
    travelTips: ["Watch your pockets on La Rambla.","Buy a T-Casual metro pass for savings."],
    hiddenGems: [
      { title: "Bunkers del Carmel", description: "The best panoramic view of the city.", image: "go/destinations/barcelona/gem1" },
      { title: "Hospital de Sant Pau", description: "A stunning modernist complex.", image: "go/destinations/barcelona/gem2" }
    ],
    nearby: [
      { name: "Montserrat", distanceKm: 50, image: "go/destinations/barcelona/near1" },
      { name: "Sitges", distanceKm: 40, image: "go/destinations/barcelona/near2" },
      { name: "Girona", distanceKm: 100, image: "go/destinations/barcelona/near3" }
    ],
    media: media("barcelona"),
    categories: ["City","Beach","Food"],
    bestSeason: "May–Jun & Sep"
  },
  {
    slug: "prague",
    name: "Prague",
    country: "Czechia",
    region: "Europe",
    summary: "Fairytale spires, cobbled lanes, and riverside beer gardens.",
    description: "Prague is a vibrant destination blending city, culture. Fairytale spires, cobbled lanes, and riverside beer gardens. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Czechia.",
    coordinates: {"lat":50.0755,"lng":14.4378},
    dna: { adventure: 49, culture: 69, food: 73, nature: 49, nightlife: 53, budgetFriendly: 85 },
    budget: { accommodation: 3000, food: 1800, transport: 1200 },
    travelTips: ["Avoid exchanging money at the airport.","Walk across Charles Bridge at sunrise."],
    hiddenGems: [
      { title: "Vysehrad", description: "A historic fort with fewer tourists.", image: "go/destinations/prague/gem1" },
      { title: "Letna Park", description: "Beer gardens with sweeping city views.", image: "go/destinations/prague/gem2" }
    ],
    nearby: [
      { name: "Kutna Hora", distanceKm: 80, image: "go/destinations/prague/near1" },
      { name: "Cesky Krumlov", distanceKm: 170, image: "go/destinations/prague/near2" },
      { name: "Karlovy Vary", distanceKm: 130, image: "go/destinations/prague/near3" }
    ],
    media: media("prague"),
    categories: ["City","Culture"],
    bestSeason: "May–Sep"
  },
  {
    slug: "vienna",
    name: "Vienna",
    country: "Austria",
    region: "Europe",
    summary: "Imperial palaces, coffee houses, and effortless old-world elegance.",
    description: "Vienna is a vibrant destination blending city, culture, luxury. Imperial palaces, coffee houses, and effortless old-world elegance. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Austria.",
    coordinates: {"lat":48.2082,"lng":16.3738},
    dna: { adventure: 54, culture: 77, food: 72, nature: 51, nightlife: 87, budgetFriendly: 35 },
    budget: { accommodation: 4500, food: 2700, transport: 1800 },
    travelTips: ["Stand on the right on escalators.","Visit coffee houses for a slow, traditional experience."],
    hiddenGems: [
      { title: "Hundertwasserhaus", description: "Quirky, colorful apartment building.", image: "go/destinations/vienna/gem1" },
      { title: "Kahlenberg", description: "A hill offering views of the whole city.", image: "go/destinations/vienna/gem2" }
    ],
    nearby: [
      { name: "Bratislava", distanceKm: 80, image: "go/destinations/vienna/near1" },
      { name: "Salzburg", distanceKm: 295, image: "go/destinations/vienna/near2" },
      { name: "Budapest", distanceKm: 240, image: "go/destinations/vienna/near3" }
    ],
    media: media("vienna"),
    categories: ["City","Culture","Luxury"],
    bestSeason: "Apr–May & Sep–Oct"
  },
  {
    slug: "san-francisco",
    name: "San Francisco",
    country: "United States",
    region: "North America",
    summary: "Fog-wrapped hills, the Golden Gate, and a serious food scene.",
    description: "San Francisco is a vibrant destination blending city, nature, food. Fog-wrapped hills, the Golden Gate, and a serious food scene. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in United States.",
    coordinates: {"lat":37.7749,"lng":-122.4194},
    dna: { adventure: 77, culture: 51, food: 64, nature: 73, nightlife: 76, budgetFriendly: 35 },
    budget: { accommodation: 7500, food: 4500, transport: 3000 },
    travelTips: ["Pack layers; the fog rolls in quickly.","Use Clipper cards for transit."],
    hiddenGems: [
      { title: "Sutro Baths", description: "Ruins of a massive public bathhouse.", image: "go/destinations/san-francisco/gem1" },
      { title: "Mosaic Steps", description: "Beautifully tiled stairways.", image: "go/destinations/san-francisco/gem2" }
    ],
    nearby: [
      { name: "Sausalito", distanceKm: 15, image: "go/destinations/san-francisco/near1" },
      { name: "Muir Woods", distanceKm: 25, image: "go/destinations/san-francisco/near2" },
      { name: "Napa Valley", distanceKm: 80, image: "go/destinations/san-francisco/near3" }
    ],
    media: media("san-francisco"),
    categories: ["City","Nature","Food"],
    bestSeason: "Sep–Nov"
  },
  {
    slug: "vancouver",
    name: "Vancouver",
    country: "Canada",
    region: "North America",
    summary: "Where rainforest, ocean, and mountains meet a glass skyline.",
    description: "Vancouver is a vibrant destination blending city, nature, adventure. Where rainforest, ocean, and mountains meet a glass skyline. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Canada.",
    coordinates: {"lat":49.2827,"lng":-123.1207},
    dna: { adventure: 63, culture: 55, food: 81, nature: 72, nightlife: 57, budgetFriendly: 35 },
    budget: { accommodation: 6000, food: 3600, transport: 2400 },
    travelTips: ["Bring an umbrella, it rains often.","Rent a bike to ride around Stanley Park."],
    hiddenGems: [
      { title: "Lynn Canyon", description: "A free suspension bridge.", image: "go/destinations/vancouver/gem1" },
      { title: "Granville Island", description: "A bustling public market.", image: "go/destinations/vancouver/gem2" }
    ],
    nearby: [
      { name: "Whistler", distanceKm: 120, image: "go/destinations/vancouver/near1" },
      { name: "Victoria", distanceKm: 110, image: "go/destinations/vancouver/near2" },
      { name: "Squamish", distanceKm: 65, image: "go/destinations/vancouver/near3" }
    ],
    media: media("vancouver"),
    categories: ["City","Nature","Adventure"],
    bestSeason: "Jun–Sep"
  },
  {
    slug: "toronto",
    name: "Toronto",
    country: "Canada",
    region: "North America",
    summary: "Canada's most diverse city with vibrant neighborhoods, galleries, and food.",
    description: "Toronto is a vibrant destination blending city, culture, food. Canada's most diverse city - neighborhoods, galleries, and food. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Canada.",
    coordinates: {"lat":43.6532,"lng":-79.3832},
    dna: { adventure: 57, culture: 60, food: 78, nature: 76, nightlife: 74, budgetFriendly: 35 },
    budget: { accommodation: 5500, food: 3300, transport: 2200 },
    travelTips: ["Use the PATH underground network in winter.","Visit the St. Lawrence Market for lunch."],
    hiddenGems: [
      { title: "Distillery District", description: "Pedestrian-only village of brick buildings.", image: "go/destinations/toronto/gem1" },
      { title: "Toronto Islands", description: "A peaceful escape with skyline views.", image: "go/destinations/toronto/gem2" }
    ],
    nearby: [
      { name: "Niagara Falls", distanceKm: 130, image: "go/destinations/toronto/near1" },
      { name: "Algonquin Park", distanceKm: 270, image: "go/destinations/toronto/near2" },
      { name: "Prince Edward County", distanceKm: 200, image: "go/destinations/toronto/near3" }
    ],
    media: media("toronto"),
    categories: ["City","Culture","Food"],
    bestSeason: "May–Oct"
  },
  {
    slug: "chicago",
    name: "Chicago",
    country: "United States",
    region: "North America",
    summary: "Bold architecture, lakefront beaches, and deep-dish everything.",
    description: "Chicago is a vibrant destination blending city, culture, food. Bold architecture, lakefront beaches, and deep-dish everything. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in United States.",
    coordinates: {"lat":41.8781,"lng":-87.6298},
    dna: { adventure: 74, culture: 66, food: 52, nature: 79, nightlife: 66, budgetFriendly: 35 },
    budget: { accommodation: 5500, food: 3300, transport: 2200 },
    travelTips: ["Take the Architecture River Tour.","Dress warmly if visiting near the lake in winter."],
    hiddenGems: [
      { title: "Garfield Park Conservatory", description: "One of the largest in the US.", image: "go/destinations/chicago/gem1" },
      { title: "The 606", description: "An elevated trail for biking and walking.", image: "go/destinations/chicago/gem2" }
    ],
    nearby: [
      { name: "Milwaukee", distanceKm: 145, image: "go/destinations/chicago/near1" },
      { name: "Starved Rock", distanceKm: 150, image: "go/destinations/chicago/near2" },
      { name: "Lake Geneva", distanceKm: 130, image: "go/destinations/chicago/near3" }
    ],
    media: media("chicago"),
    categories: ["City","Culture","Food"],
    bestSeason: "May–Oct"
  },
  {
    slug: "sydney",
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    summary: "Iconic harbor, golden beaches, and an easy outdoor lifestyle.",
    description: "Sydney is a vibrant destination blending city, beach, nature. Iconic harbor, golden beaches, and an easy outdoor lifestyle. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Australia.",
    coordinates: {"lat":-33.8688,"lng":151.2093},
    dna: { adventure: 51, culture: 82, food: 82, nature: 40, nightlife: 69, budgetFriendly: 35 },
    budget: { accommodation: 6000, food: 3600, transport: 2400 },
    travelTips: ["Use an Opal card for ferries and trains.","Swim between the red and yellow flags at the beach."],
    hiddenGems: [
      { title: "Wendys Secret Garden", description: "A hidden oasis overlooking the harbor.", image: "go/destinations/sydney/gem1" },
      { title: "Glebe Markets", description: "Vintage clothes and local food.", image: "go/destinations/sydney/gem2" }
    ],
    nearby: [
      { name: "Blue Mountains", distanceKm: 100, image: "go/destinations/sydney/near1" },
      { name: "Hunter Valley", distanceKm: 250, image: "go/destinations/sydney/near2" },
      { name: "Bondi Beach", distanceKm: 10, image: "go/destinations/sydney/near3" }
    ],
    media: media("sydney"),
    categories: ["City","Beach","Nature"],
    bestSeason: "Sep–Nov & Mar–May"
  },
  {
    slug: "melbourne",
    name: "Melbourne",
    country: "Australia",
    region: "Oceania",
    summary: "Laneway cafés, street art, and Australia's culture capital.",
    description: "Melbourne is a vibrant destination blending city, culture, food. Laneway cafés, street art, and Australia's culture capital. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Australia.",
    coordinates: {"lat":-37.8136,"lng":144.9631},
    dna: { adventure: 51, culture: 81, food: 61, nature: 76, nightlife: 54, budgetFriendly: 35 },
    budget: { accommodation: 5500, food: 3300, transport: 2200 },
    travelTips: ["Trams in the CBD are free.","Explore the hidden laneways for the best coffee."],
    hiddenGems: [
      { title: "ACMI", description: "Museum of screen culture.", image: "go/destinations/melbourne/gem1" },
      { title: "Abbotsford Convent", description: "Arts and cultural precinct.", image: "go/destinations/melbourne/gem2" }
    ],
    nearby: [
      { name: "Great Ocean Road", distanceKm: 100, image: "go/destinations/melbourne/near1" },
      { name: "Yarra Valley", distanceKm: 50, image: "go/destinations/melbourne/near2" },
      { name: "Phillip Island", distanceKm: 140, image: "go/destinations/melbourne/near3" }
    ],
    media: media("melbourne"),
    categories: ["City","Culture","Food"],
    bestSeason: "Mar–May & Sep–Nov"
  },
  {
    slug: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    region: "Oceania",
    summary: "The adventure capital featuring alpine lakes, peaks, and adrenaline.",
    description: "Queenstown is a vibrant destination blending nature, adventure. The adventure capital - alpine lakes, peaks, and adrenaline. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in New Zealand.",
    coordinates: {"lat":-45.0312,"lng":168.6626},
    dna: { adventure: 64, culture: 87, food: 69, nature: 66, nightlife: 81, budgetFriendly: 35 },
    budget: { accommodation: 6500, food: 3900, transport: 2600 },
    travelTips: ["Book adventure activities in advance.","Rent a car to explore the surrounding lakes."],
    hiddenGems: [
      { title: "Moke Lake", description: "A stunningly reflective lake.", image: "go/destinations/queenstown/gem1" },
      { title: "Arrowtown", description: "A historic gold mining town.", image: "go/destinations/queenstown/gem2" }
    ],
    nearby: [
      { name: "Milford Sound", distanceKm: 290, image: "go/destinations/queenstown/near1" },
      { name: "Wanaka", distanceKm: 70, image: "go/destinations/queenstown/near2" },
      { name: "Glenorchy", distanceKm: 45, image: "go/destinations/queenstown/near3" }
    ],
    media: media("queenstown"),
    categories: ["Nature","Adventure"],
    bestSeason: "Dec–Feb & Jun–Aug"
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    summary: "Desert futurism with record-breaking towers, malls, and beaches.",
    description: "Dubai is a vibrant destination blending city, luxury, beach. Desert futurism - record-breaking towers, malls, and beaches. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in United Arab Emirates.",
    coordinates: {"lat":25.2048,"lng":55.2708},
    dna: { adventure: 48, culture: 77, food: 52, nature: 70, nightlife: 41, budgetFriendly: 35 },
    budget: { accommodation: 8000, food: 4800, transport: 3200 },
    travelTips: ["Dress modestly in public areas.","Taxis are cheap, use them to get around."],
    hiddenGems: [
      { title: "Al Fahidi", description: "The historic district of Dubai.", image: "go/destinations/dubai/gem1" },
      { title: "Kite Beach", description: "A relaxed beach spot for water sports.", image: "go/destinations/dubai/gem2" }
    ],
    nearby: [
      { name: "Abu Dhabi", distanceKm: 140, image: "go/destinations/dubai/near1" },
      { name: "Sharjah", distanceKm: 30, image: "go/destinations/dubai/near2" },
      { name: "Hatta", distanceKm: 130, image: "go/destinations/dubai/near3" }
    ],
    media: media("dubai"),
    categories: ["City","Luxury","Beach"],
    bestSeason: "Nov–Mar"
  },
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Türkiye",
    region: "Middle East",
    summary: "Two continents, grand bazaars, and Byzantine-Ottoman splendor.",
    description: "Istanbul is a vibrant destination blending city, culture, food. Two continents, grand bazaars, and Byzantine-Ottoman splendor. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Türkiye.",
    coordinates: {"lat":41.0082,"lng":28.9784},
    dna: { adventure: 44, culture: 88, food: 57, nature: 65, nightlife: 86, budgetFriendly: 85 },
    budget: { accommodation: 3000, food: 1800, transport: 1200 },
    travelTips: ["Carry a scarf for mosque visits.","Bargain at the Grand Bazaar, but not in boutiques."],
    hiddenGems: [
      { title: "Balat", description: "Colorful houses and cafes.", image: "go/destinations/istanbul/gem1" },
      { title: "Camlica Hill", description: "The highest point in Istanbul.", image: "go/destinations/istanbul/gem2" }
    ],
    nearby: [
      { name: "Bursa", distanceKm: 150, image: "go/destinations/istanbul/near1" },
      { name: "Princes Islands", distanceKm: 20, image: "go/destinations/istanbul/near2" },
      { name: "Edirne", distanceKm: 240, image: "go/destinations/istanbul/near3" }
    ],
    media: media("istanbul"),
    categories: ["City","Culture","Food"],
    bestSeason: "Apr–May & Sep–Nov"
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    summary: "Table Mountain, wine country, and dramatic coastal drives.",
    description: "Cape Town is a vibrant destination blending nature, beach, adventure. Table Mountain, wine country, and dramatic coastal drives. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in South Africa.",
    coordinates: {"lat":-33.9249,"lng":18.4241},
    dna: { adventure: 43, culture: 63, food: 54, nature: 53, nightlife: 52, budgetFriendly: 35 },
    budget: { accommodation: 4500, food: 2700, transport: 1800 },
    travelTips: ["Use Uber rather than hailing taxis.","Check the wind before going up Table Mountain."],
    hiddenGems: [
      { title: "Kalk Bay", description: "A vibrant fishing village.", image: "go/destinations/cape-town/gem1" },
      { title: "Woodstock", description: "A hip neighborhood known for street art.", image: "go/destinations/cape-town/gem2" }
    ],
    nearby: [
      { name: "Stellenbosch", distanceKm: 50, image: "go/destinations/cape-town/near1" },
      { name: "Cape of Good Hope", distanceKm: 70, image: "go/destinations/cape-town/near2" },
      { name: "Franschhoek", distanceKm: 80, image: "go/destinations/cape-town/near3" }
    ],
    media: media("cape-town"),
    categories: ["Nature","Beach","Adventure"],
    bestSeason: "Nov–Mar"
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    summary: "Souk mazes, riad courtyards, and the edge of the Sahara.",
    description: "Marrakech is a vibrant destination blending culture, adventure, luxury. Souk mazes, riad courtyards, and the edge of the Sahara. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Morocco.",
    coordinates: {"lat":31.6295,"lng":-7.9811},
    dna: { adventure: 41, culture: 66, food: 69, nature: 39, nightlife: 84, budgetFriendly: 85 },
    budget: { accommodation: 3000, food: 1800, transport: 1200 },
    travelTips: ["Agree on taxi fares before getting in.","Get lost in the Medina, it is part of the fun."],
    hiddenGems: [
      { title: "Le Jardin Secret", description: "A beautifully restored palace garden.", image: "go/destinations/marrakech/gem1" },
      { title: "Maison de la Photographie", description: "A museum showcasing Moroccan history.", image: "go/destinations/marrakech/gem2" }
    ],
    nearby: [
      { name: "Atlas Mountains", distanceKm: 60, image: "go/destinations/marrakech/near1" },
      { name: "Essaouira", distanceKm: 190, image: "go/destinations/marrakech/near2" },
      { name: "Agafay Desert", distanceKm: 30, image: "go/destinations/marrakech/near3" }
    ],
    media: media("marrakech"),
    categories: ["Culture","Adventure","Luxury"],
    bestSeason: "Mar–May & Sep–Nov"
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    summary: "Royal pageantry, world-class museums, and a pub on every corner.",
    description: "London is a vibrant destination blending city, culture, food. Royal pageantry, world-class museums, and a pub on every corner. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in the United Kingdom.",
    coordinates: { lat: 51.5074, lng: -0.1278 },
    dna: { adventure: 45, culture: 90, food: 80, nature: 40, nightlife: 85, budgetFriendly: 30 },
    budget: { accommodation: 7000, food: 3000, transport: 2000 },
    travelTips: ["Get a contactless or Oyster card for the Tube.","Many of the best museums are free to enter."],
    hiddenGems: [
      { title: "Leadenhall Market", description: "An ornate Victorian covered market.", image: "go/destinations/london/gem1" },
      { title: "Daunt Books Marylebone", description: "A galleried Edwardian travel bookshop.", image: "go/destinations/london/gem2" }
    ],
    nearby: [
      { name: "Windsor", distanceKm: 40, image: "go/destinations/london/near1" },
      { name: "Oxford", distanceKm: 90, image: "go/destinations/london/near2" },
      { name: "Brighton", distanceKm: 85, image: "go/destinations/london/near3" }
    ],
    media: media("london"),
    categories: ["City","Culture","Food","Nightlife"],
    bestSeason: "May–Sep"
  },
  {
    slug: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    summary: "Tiled facades, hilltop miradouros, and soulful fado nights.",
    description: "Lisbon is a vibrant destination blending city, food, culture. Tiled facades, hilltop miradouros, and soulful fado nights. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Portugal.",
    coordinates: { lat: 38.7223, lng: -9.1393 },
    dna: { adventure: 55, culture: 80, food: 85, nature: 55, nightlife: 78, budgetFriendly: 65 },
    budget: { accommodation: 4000, food: 2000, transport: 1200 },
    travelTips: ["Wear good shoes for the steep cobbled hills.","Ride Tram 28 early to beat the crowds."],
    hiddenGems: [
      { title: "LX Factory", description: "A creative hub of shops under a bridge.", image: "go/destinations/lisbon/gem1" },
      { title: "Miradouro da Senhora do Monte", description: "The city's finest sunset viewpoint.", image: "go/destinations/lisbon/gem2" }
    ],
    nearby: [
      { name: "Sintra", distanceKm: 30, image: "go/destinations/lisbon/near1" },
      { name: "Cascais", distanceKm: 30, image: "go/destinations/lisbon/near2" },
      { name: "Setúbal", distanceKm: 50, image: "go/destinations/lisbon/near3" }
    ],
    media: media("lisbon"),
    categories: ["City","Culture","Food"],
    bestSeason: "Mar–Oct"
  },
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    summary: "Whitewashed cliffs, caldera sunsets, and volcanic beaches.",
    description: "Santorini is a vibrant destination blending beach, romance, luxury. Whitewashed cliffs, caldera sunsets, and volcanic beaches. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Greece.",
    coordinates: { lat: 36.3932, lng: 25.4615 },
    dna: { adventure: 45, culture: 60, food: 75, nature: 80, nightlife: 65, budgetFriendly: 35 },
    budget: { accommodation: 6000, food: 2800, transport: 1500 },
    travelTips: ["Book sunset dinners in Oia well ahead.","Rent an ATV to reach the quieter beaches."],
    hiddenGems: [
      { title: "Pyrgos Village", description: "A quiet hilltop town above the crowds.", image: "go/destinations/santorini/gem1" },
      { title: "Red Beach", description: "Dramatic crimson volcanic cliffs.", image: "go/destinations/santorini/gem2" }
    ],
    nearby: [
      { name: "Oia", distanceKm: 11, image: "go/destinations/santorini/near1" },
      { name: "Thirassia", distanceKm: 5, image: "go/destinations/santorini/near2" },
      { name: "Ios", distanceKm: 25, image: "go/destinations/santorini/near3" }
    ],
    media: media("santorini"),
    categories: ["Beach","Romance","Luxury"],
    bestSeason: "Apr–Oct"
  },
  {
    slug: "venice",
    name: "Venice",
    country: "Italy",
    region: "Europe",
    summary: "Canal labyrinths, Byzantine domes, and timeless romance.",
    description: "Venice is a vibrant destination blending city, culture, romance. Canal labyrinths, Byzantine domes, and timeless romance. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Italy.",
    coordinates: { lat: 45.4408, lng: 12.3155 },
    dna: { adventure: 35, culture: 92, food: 80, nature: 45, nightlife: 55, budgetFriendly: 35 },
    budget: { accommodation: 6500, food: 2800, transport: 1500 },
    travelTips: ["Validate vaporetto tickets before boarding.","Wander away from San Marco for the real Venice."],
    hiddenGems: [
      { title: "Libreria Acqua Alta", description: "A bookshop that stores books in gondolas.", image: "go/destinations/venice/gem1" },
      { title: "Cannaregio", description: "A local canal district with cicchetti bars.", image: "go/destinations/venice/gem2" }
    ],
    nearby: [
      { name: "Murano", distanceKm: 2, image: "go/destinations/venice/near1" },
      { name: "Burano", distanceKm: 7, image: "go/destinations/venice/near2" },
      { name: "Padua", distanceKm: 40, image: "go/destinations/venice/near3" }
    ],
    media: media("venice"),
    categories: ["City","Culture","Romance"],
    bestSeason: "Apr–Jun & Sep–Oct"
  },
  {
    slug: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    region: "Europe",
    summary: "Northern lights, geothermal lagoons, and raw volcanic wilderness.",
    description: "Reykjavik is a vibrant destination blending nature, adventure, scenic. Northern lights, geothermal lagoons, and raw volcanic wilderness. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Iceland.",
    coordinates: { lat: 64.1466, lng: -21.9426 },
    dna: { adventure: 85, culture: 60, food: 65, nature: 95, nightlife: 60, budgetFriendly: 25 },
    budget: { accommodation: 7000, food: 3200, transport: 2500 },
    travelTips: ["Rent a car to chase waterfalls and auroras.","Weather changes fast - pack warm layers."],
    hiddenGems: [
      { title: "Sky Lagoon", description: "An oceanfront geothermal spa.", image: "go/destinations/reykjavik/gem1" },
      { title: "Grótta Lighthouse", description: "A quiet aurora-watching spot.", image: "go/destinations/reykjavik/gem2" }
    ],
    nearby: [
      { name: "Golden Circle", distanceKm: 60, image: "go/destinations/reykjavik/near1" },
      { name: "Blue Lagoon", distanceKm: 50, image: "go/destinations/reykjavik/near2" },
      { name: "Reynisfjara", distanceKm: 180, image: "go/destinations/reykjavik/near3" }
    ],
    media: media("reykjavik"),
    categories: ["Nature","Adventure","Scenic"],
    bestSeason: "Jun–Aug & Sep–Mar (auroras)"
  },
  {
    slug: "berlin",
    name: "Berlin",
    country: "Germany",
    region: "Europe",
    summary: "Cold-war history, world-class techno, and fearless street art.",
    description: "Berlin is a vibrant destination blending city, culture, nightlife. Cold-war history, world-class techno, and fearless street art. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Germany.",
    coordinates: { lat: 52.52, lng: 13.405 },
    dna: { adventure: 50, culture: 85, food: 75, nature: 45, nightlife: 95, budgetFriendly: 55 },
    budget: { accommodation: 4500, food: 2200, transport: 1400 },
    travelTips: ["Carry some cash - many spots are card-averse.","Sundays, browse the Mauerpark flea market."],
    hiddenGems: [
      { title: "Teufelsberg", description: "An abandoned cold-war spy station.", image: "go/destinations/berlin/gem1" },
      { title: "Markthalle Neun", description: "A historic hall famed for street food.", image: "go/destinations/berlin/gem2" }
    ],
    nearby: [
      { name: "Potsdam", distanceKm: 35, image: "go/destinations/berlin/near1" },
      { name: "Dresden", distanceKm: 190, image: "go/destinations/berlin/near2" },
      { name: "Leipzig", distanceKm: 190, image: "go/destinations/berlin/near3" }
    ],
    media: media("berlin"),
    categories: ["City","Culture","Nightlife"],
    bestSeason: "May–Sep"
  },
  {
    slug: "hong-kong",
    name: "Hong Kong",
    country: "China",
    region: "Asia",
    summary: "Neon skylines, dim sum dynasties, and peaks above the harbor.",
    description: "Hong Kong is a vibrant destination blending city, food, nightlife. Neon skylines, dim sum dynasties, and peaks above the harbor. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in China.",
    coordinates: { lat: 22.3193, lng: 114.1694 },
    dna: { adventure: 55, culture: 78, food: 92, nature: 50, nightlife: 85, budgetFriendly: 45 },
    budget: { accommodation: 5500, food: 2500, transport: 1500 },
    travelTips: ["Get an Octopus card for transit and shops.","Ride the Star Ferry across the harbor at dusk."],
    hiddenGems: [
      { title: "Tai Kwun", description: "A heritage prison turned arts hub.", image: "go/destinations/hong-kong/gem1" },
      { title: "Cat Street", description: "An antiques-and-curios lane.", image: "go/destinations/hong-kong/gem2" }
    ],
    nearby: [
      { name: "Lantau Island", distanceKm: 30, image: "go/destinations/hong-kong/near1" },
      { name: "Macau", distanceKm: 60, image: "go/destinations/hong-kong/near2" },
      { name: "Shenzhen", distanceKm: 35, image: "go/destinations/hong-kong/near3" }
    ],
    media: media("hong-kong"),
    categories: ["City","Food","Nightlife"],
    bestSeason: "Oct–Dec"
  },
  {
    slug: "taipei",
    name: "Taipei",
    country: "Taiwan",
    region: "Asia",
    summary: "Night-market feasts, hot springs, and mountain temples.",
    description: "Taipei is a vibrant destination blending city, food, culture. Night-market feasts, hot springs, and mountain temples. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Taiwan.",
    coordinates: { lat: 25.033, lng: 121.5654 },
    dna: { adventure: 55, culture: 75, food: 90, nature: 60, nightlife: 80, budgetFriendly: 65 },
    budget: { accommodation: 3800, food: 1800, transport: 1200 },
    travelTips: ["Use an EasyCard on the metro, buses, and shops.","Graze the night markets for cheap, great eats."],
    hiddenGems: [
      { title: "Treasure Hill", description: "An artist village on the river's edge.", image: "go/destinations/taipei/gem1" },
      { title: "Beitou Hot Springs", description: "Geothermal baths in a leafy valley.", image: "go/destinations/taipei/gem2" }
    ],
    nearby: [
      { name: "Jiufen", distanceKm: 30, image: "go/destinations/taipei/near1" },
      { name: "Yangmingshan", distanceKm: 20, image: "go/destinations/taipei/near2" },
      { name: "Tamsui", distanceKm: 25, image: "go/destinations/taipei/near3" }
    ],
    media: media("taipei"),
    categories: ["City","Food","Culture"],
    bestSeason: "Oct–Apr"
  },
  {
    slug: "chiang-mai",
    name: "Chiang Mai",
    country: "Thailand",
    region: "Asia",
    summary: "Lantern festivals, jungle temples, and gentle northern charm.",
    description: "Chiang Mai is a vibrant destination blending culture, nature, budget. Lantern festivals, jungle temples, and gentle northern charm. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Thailand.",
    coordinates: { lat: 18.7883, lng: 98.9853 },
    dna: { adventure: 75, culture: 82, food: 85, nature: 80, nightlife: 60, budgetFriendly: 88 },
    budget: { accommodation: 2500, food: 1200, transport: 800 },
    travelTips: ["Visit during Yi Peng for the lantern festival.","Respect dress codes when entering temples."],
    hiddenGems: [
      { title: "Wat Pha Lat", description: "A serene temple hidden in the forest.", image: "go/destinations/chiang-mai/gem1" },
      { title: "Nimmanhaemin", description: "A leafy district of cafes and design shops.", image: "go/destinations/chiang-mai/gem2" }
    ],
    nearby: [
      { name: "Doi Inthanon", distanceKm: 90, image: "go/destinations/chiang-mai/near1" },
      { name: "Pai", distanceKm: 130, image: "go/destinations/chiang-mai/near2" },
      { name: "Chiang Rai", distanceKm: 190, image: "go/destinations/chiang-mai/near3" }
    ],
    media: media("chiang-mai"),
    categories: ["Culture","Nature","Budget"],
    bestSeason: "Nov–Feb"
  },
  {
    slug: "siem-reap",
    name: "Siem Reap",
    country: "Cambodia",
    region: "Asia",
    summary: "Sunrise over Angkor, jungle ruins, and Khmer warmth.",
    description: "Siem Reap is a vibrant destination blending culture, adventure, budget. Sunrise over Angkor, jungle ruins, and Khmer warmth. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Cambodia.",
    coordinates: { lat: 13.3671, lng: 103.8448 },
    dna: { adventure: 65, culture: 95, food: 70, nature: 65, nightlife: 55, budgetFriendly: 85 },
    budget: { accommodation: 2500, food: 1300, transport: 900 },
    travelTips: ["Buy a multi-day Angkor pass to avoid the rush.","Start at Angkor Wat before dawn for sunrise."],
    hiddenGems: [
      { title: "Ta Prohm", description: "A temple wrapped in giant tree roots.", image: "go/destinations/siem-reap/gem1" },
      { title: "Kompong Khleang", description: "A stilted floating village on the lake.", image: "go/destinations/siem-reap/gem2" }
    ],
    nearby: [
      { name: "Angkor Wat", distanceKm: 6, image: "go/destinations/siem-reap/near1" },
      { name: "Banteay Srei", distanceKm: 30, image: "go/destinations/siem-reap/near2" },
      { name: "Tonlé Sap", distanceKm: 15, image: "go/destinations/siem-reap/near3" }
    ],
    media: media("siem-reap"),
    categories: ["Culture","Adventure","Budget"],
    bestSeason: "Nov–Feb"
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    country: "India",
    region: "Asia",
    summary: "Pink-hued palaces, hilltop forts, and bazaar color.",
    description: "Jaipur is a vibrant destination blending culture, city, budget. Pink-hued palaces, hilltop forts, and bazaar color. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in India.",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    dna: { adventure: 55, culture: 92, food: 80, nature: 45, nightlife: 50, budgetFriendly: 85 },
    budget: { accommodation: 2800, food: 1300, transport: 900 },
    travelTips: ["Negotiate firmly and kindly in the bazaars.","See Amber Fort early to beat heat and crowds."],
    hiddenGems: [
      { title: "Panna Meena ka Kund", description: "A symmetrical ancient stepwell.", image: "go/destinations/jaipur/gem1" },
      { title: "Anokhi Museum", description: "A museum of hand-block printing.", image: "go/destinations/jaipur/gem2" }
    ],
    nearby: [
      { name: "Amber Fort", distanceKm: 11, image: "go/destinations/jaipur/near1" },
      { name: "Pushkar", distanceKm: 145, image: "go/destinations/jaipur/near2" },
      { name: "Ranthambore", distanceKm: 160, image: "go/destinations/jaipur/near3" }
    ],
    media: media("jaipur"),
    categories: ["Culture","City","Budget"],
    bestSeason: "Oct–Mar"
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    region: "Asia",
    summary: "Overwater villas, coral reefs, and impossibly clear lagoons.",
    description: "Maldives is a vibrant destination blending beach, luxury, wellness. Overwater villas, coral reefs, and impossibly clear lagoons. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in the Maldives.",
    coordinates: { lat: 3.2028, lng: 73.2207 },
    dna: { adventure: 60, culture: 35, food: 60, nature: 95, nightlife: 40, budgetFriendly: 20 },
    budget: { accommodation: 12000, food: 4000, transport: 2500 },
    travelTips: ["Choose a resort island or a local island by budget.","Snorkel the house reef at slack tide."],
    hiddenGems: [
      { title: "Hanifaru Bay", description: "A famed manta-ray gathering point.", image: "go/destinations/maldives/gem1" },
      { title: "Local-island sandbanks", description: "Empty sandbars for a private picnic.", image: "go/destinations/maldives/gem2" }
    ],
    nearby: [
      { name: "Malé", distanceKm: 30, image: "go/destinations/maldives/near1" },
      { name: "Ari Atoll", distanceKm: 80, image: "go/destinations/maldives/near2" },
      { name: "Baa Atoll", distanceKm: 120, image: "go/destinations/maldives/near3" }
    ],
    media: media("maldives"),
    categories: ["Beach","Luxury","Wellness"],
    bestSeason: "Nov–Apr"
  },
  {
    slug: "rio-de-janeiro",
    name: "Rio de Janeiro",
    country: "Brazil",
    region: "South America",
    summary: "Mountain-framed beaches, samba nights, and carnival spirit.",
    description: "Rio de Janeiro is a vibrant destination blending beach, nightlife, nature. Mountain-framed beaches, samba nights, and carnival spirit. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Brazil.",
    coordinates: { lat: -22.9068, lng: -43.1729 },
    dna: { adventure: 75, culture: 75, food: 75, nature: 85, nightlife: 90, budgetFriendly: 55 },
    budget: { accommodation: 4000, food: 2000, transport: 1300 },
    travelTips: ["Stay aware of your belongings on the beach.","Hike Dois Irmãos for the best city view."],
    hiddenGems: [
      { title: "Parque Lage", description: "A jungle mansion below Corcovado.", image: "go/destinations/rio-de-janeiro/gem1" },
      { title: "Pedra do Telégrafo", description: "A clifftop photo spot south of the city.", image: "go/destinations/rio-de-janeiro/gem2" }
    ],
    nearby: [
      { name: "Petrópolis", distanceKm: 70, image: "go/destinations/rio-de-janeiro/near1" },
      { name: "Ilha Grande", distanceKm: 150, image: "go/destinations/rio-de-janeiro/near2" },
      { name: "Búzios", distanceKm: 170, image: "go/destinations/rio-de-janeiro/near3" }
    ],
    media: media("rio-de-janeiro"),
    categories: ["Beach","Nightlife","Nature"],
    bestSeason: "Dec–Mar"
  },
  {
    slug: "cusco",
    name: "Cusco",
    country: "Peru",
    region: "South America",
    summary: "Inca stonework, Andean markets, and the gateway to Machu Picchu.",
    description: "Cusco is a vibrant destination blending adventure, culture, nature. Inca stonework, Andean markets, and the gateway to Machu Picchu. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Peru.",
    coordinates: { lat: -13.532, lng: -71.9675 },
    dna: { adventure: 90, culture: 90, food: 70, nature: 88, nightlife: 55, budgetFriendly: 70 },
    budget: { accommodation: 3000, food: 1500, transport: 1000 },
    travelTips: ["Acclimatize for two days before any trek.","Coca tea helps with the high altitude."],
    hiddenGems: [
      { title: "San Blas", description: "A cobbled artisan neighborhood.", image: "go/destinations/cusco/gem1" },
      { title: "Rainbow Mountain", description: "Striped peaks on a high-altitude trek.", image: "go/destinations/cusco/gem2" }
    ],
    nearby: [
      { name: "Machu Picchu", distanceKm: 75, image: "go/destinations/cusco/near1" },
      { name: "Sacred Valley", distanceKm: 30, image: "go/destinations/cusco/near2" },
      { name: "Maras Salt Mines", distanceKm: 40, image: "go/destinations/cusco/near3" }
    ],
    media: media("cusco"),
    categories: ["Adventure","Culture","Nature"],
    bestSeason: "May–Sep"
  },
  {
    slug: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    region: "South America",
    summary: "Tango halls, grand boulevards, and late-night steak.",
    description: "Buenos Aires is a vibrant destination blending city, food, nightlife. Tango halls, grand boulevards, and late-night steak. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Argentina.",
    coordinates: { lat: -34.6037, lng: -58.3816 },
    dna: { adventure: 45, culture: 85, food: 85, nature: 40, nightlife: 92, budgetFriendly: 60 },
    budget: { accommodation: 3500, food: 1800, transport: 1100 },
    travelTips: ["Dinner starts late - 9pm or later.","Carry cash for the best exchange rates."],
    hiddenGems: [
      { title: "El Ateneo Grand Splendid", description: "A grand theater turned bookstore.", image: "go/destinations/buenos-aires/gem1" },
      { title: "Feria de Mataderos", description: "A folk market of crafts and dance.", image: "go/destinations/buenos-aires/gem2" }
    ],
    nearby: [
      { name: "Tigre Delta", distanceKm: 30, image: "go/destinations/buenos-aires/near1" },
      { name: "Colonia", distanceKm: 50, image: "go/destinations/buenos-aires/near2" },
      { name: "La Plata", distanceKm: 60, image: "go/destinations/buenos-aires/near3" }
    ],
    media: media("buenos-aires"),
    categories: ["City","Food","Nightlife"],
    bestSeason: "Sep–Nov & Mar–May"
  },
  {
    slug: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    region: "North America",
    summary: "Aztec roots, mural-lined plazas, and a fearless food scene.",
    description: "Mexico City is a vibrant destination blending city, food, culture. Aztec roots, mural-lined plazas, and a fearless food scene. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Mexico.",
    coordinates: { lat: 19.4326, lng: -99.1332 },
    dna: { adventure: 55, culture: 88, food: 92, nature: 45, nightlife: 82, budgetFriendly: 70 },
    budget: { accommodation: 3500, food: 1800, transport: 1200 },
    travelTips: ["Eat tacos al pastor from the busiest stalls.","The altitude is real - pace your first day."],
    hiddenGems: [
      { title: "Mercado de San Juan", description: "A gourmet market of rare ingredients.", image: "go/destinations/mexico-city/gem1" },
      { title: "Casa Luis Barragán", description: "The architect's luminous modernist home.", image: "go/destinations/mexico-city/gem2" }
    ],
    nearby: [
      { name: "Teotihuacan", distanceKm: 50, image: "go/destinations/mexico-city/near1" },
      { name: "Xochimilco", distanceKm: 25, image: "go/destinations/mexico-city/near2" },
      { name: "Puebla", distanceKm: 130, image: "go/destinations/mexico-city/near3" }
    ],
    media: media("mexico-city"),
    categories: ["City","Food","Culture"],
    bestSeason: "Mar–May"
  },
  {
    slug: "banff",
    name: "Banff",
    country: "Canada",
    region: "North America",
    summary: "Turquoise lakes, glacier peaks, and Rocky Mountain trails.",
    description: "Banff is a vibrant destination blending mountains, nature, adventure. Turquoise lakes, glacier peaks, and Rocky Mountain trails. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Canada.",
    coordinates: { lat: 51.1784, lng: -115.5708 },
    dna: { adventure: 92, culture: 35, food: 50, nature: 98, nightlife: 35, budgetFriendly: 40 },
    budget: { accommodation: 6000, food: 2800, transport: 1800 },
    travelTips: ["Buy a Parks Canada pass before you arrive.","Reach Moraine Lake before sunrise for parking."],
    hiddenGems: [
      { title: "Johnston Canyon", description: "A catwalk trail to frozen waterfalls.", image: "go/destinations/banff/gem1" },
      { title: "Moraine Lake", description: "Glacier-fed turquoise beneath ten peaks.", image: "go/destinations/banff/gem2" }
    ],
    nearby: [
      { name: "Lake Louise", distanceKm: 60, image: "go/destinations/banff/near1" },
      { name: "Yoho", distanceKm: 80, image: "go/destinations/banff/near2" },
      { name: "Jasper", distanceKm: 290, image: "go/destinations/banff/near3" }
    ],
    media: media("banff"),
    categories: ["Mountains","Nature","Adventure"],
    bestSeason: "Jun–Aug & Dec–Mar (ski)"
  },
  {
    slug: "auckland",
    name: "Auckland",
    country: "New Zealand",
    region: "Oceania",
    summary: "Harbor sails, volcanic cones, and island day-trips.",
    description: "Auckland is a vibrant destination blending city, nature, adventure. Harbor sails, volcanic cones, and island day-trips. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in New Zealand.",
    coordinates: { lat: -36.8485, lng: 174.7633 },
    dna: { adventure: 70, culture: 60, food: 70, nature: 80, nightlife: 65, budgetFriendly: 45 },
    budget: { accommodation: 5000, food: 2400, transport: 1600 },
    travelTips: ["Ferry to Waiheke for wine and beaches.","Weather shifts fast - always pack a layer."],
    hiddenGems: [
      { title: "Waiheke Island", description: "Vineyards and coves a short ferry away.", image: "go/destinations/auckland/gem1" },
      { title: "Mount Eden", description: "A grassy volcanic crater over the city.", image: "go/destinations/auckland/gem2" }
    ],
    nearby: [
      { name: "Waiheke Island", distanceKm: 20, image: "go/destinations/auckland/near1" },
      { name: "Piha Beach", distanceKm: 40, image: "go/destinations/auckland/near2" },
      { name: "Rotorua", distanceKm: 230, image: "go/destinations/auckland/near3" }
    ],
    media: media("auckland"),
    categories: ["City","Nature","Adventure"],
    bestSeason: "Dec–Mar"
  },
  {
    slug: "cairo",
    name: "Cairo",
    country: "Egypt",
    region: "Africa",
    summary: "Pyramids on the skyline, bazaars, and the eternal Nile.",
    description: "Cairo is a vibrant destination blending culture, city, adventure. Pyramids on the skyline, bazaars, and the eternal Nile. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Egypt.",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    dna: { adventure: 60, culture: 95, food: 70, nature: 40, nightlife: 55, budgetFriendly: 80 },
    budget: { accommodation: 3000, food: 1500, transport: 1000 },
    travelTips: ["Agree taxi fares first or use ride apps.","Visit the pyramids right at opening time."],
    hiddenGems: [
      { title: "Al-Muizz Street", description: "A medieval street glowing at night.", image: "go/destinations/cairo/gem1" },
      { title: "Coptic Cairo", description: "Ancient churches and the Hanging Church.", image: "go/destinations/cairo/gem2" }
    ],
    nearby: [
      { name: "Giza Pyramids", distanceKm: 20, image: "go/destinations/cairo/near1" },
      { name: "Saqqara", distanceKm: 30, image: "go/destinations/cairo/near2" },
      { name: "Alexandria", distanceKm: 220, image: "go/destinations/cairo/near3" }
    ],
    media: media("cairo"),
    categories: ["Culture","City","Adventure"],
    bestSeason: "Oct–Apr"
  },
  {
    slug: "petra",
    name: "Petra",
    country: "Jordan",
    region: "Middle East",
    summary: "A rose-red rock city carved into desert canyons.",
    description: "Petra is a vibrant destination blending culture, adventure, scenic. A rose-red rock city carved into desert canyons. Expect a journey full of remarkable sights, delicious local flavors, and unforgettable experiences in Jordan.",
    coordinates: { lat: 30.3285, lng: 35.4444 },
    dna: { adventure: 80, culture: 92, food: 55, nature: 75, nightlife: 35, budgetFriendly: 65 },
    budget: { accommodation: 4000, food: 1800, transport: 1500 },
    travelTips: ["Start early and carry plenty of water.","Hike to the Monastery for fewer crowds."],
    hiddenGems: [
      { title: "Petra by Night", description: "The Treasury lit by a thousand candles.", image: "go/destinations/petra/gem1" },
      { title: "Ad Deir (Monastery)", description: "A vast facade up 800 rock-cut steps.", image: "go/destinations/petra/gem2" }
    ],
    nearby: [
      { name: "Wadi Rum", distanceKm: 110, image: "go/destinations/petra/near1" },
      { name: "Little Petra", distanceKm: 15, image: "go/destinations/petra/near2" },
      { name: "Aqaba", distanceKm: 130, image: "go/destinations/petra/near3" }
    ],
    media: media("petra"),
    categories: ["Culture","Adventure","Scenic"],
    bestSeason: "Mar–May & Sep–Nov"
  }
];

export function getExploreDestination(slug: string): Destination | undefined {
  return EXPLORE_DESTINATIONS.find((d) => d.slug === slug);
}

export function exploreToSummary(d: Destination): DestinationSummary {
  return toSummary(d);
}

/** All destination objects (both tiers) - for deriving facets. */
export const ALL_DESTINATIONS: Destination[] = [
  ...DESTINATIONS,
  ...EXPLORE_DESTINATIONS,
];

/** Every slug that has a detail page (Tier 1 + Tier 2). */
export const ALL_DESTINATION_SLUGS = [
  ...DESTINATION_SLUGS,
  ...EXPLORE_DESTINATIONS.map((d) => d.slug),
];

/** Unified getDestination searches ALL tiers. */
export function getDestination(slug: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.slug === slug);
}

/** Per-day budget in cents for any tier (featured = sum of breakdown). */
export function budgetPerDayFor(d: Destination): number {
  return d.budget.accommodation + d.budget.food + d.budget.transport;
}
