// Image resolver (07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md §7).
// Production: Cloudinary delivery with f_auto/q_auto and a fill crop.
// Dev (no Cloudinary cloud configured): deterministic placeholder so the guest
// experience renders immediately. Same public id -> same image (stable demo).

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface ImageOptions {
  w: number;
  h: number;
}

export function imageUrl(publicId: string, { w, h }: ImageOptions): string {
  if (cloud) {
    const t = `f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}`;
    return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
  }
  // Deterministic dev placeholder using realistic Unsplash URLs.
  const idMap: Record<string, string[]> = {
    bali: [
      "https://images.unsplash.com/photo-1557939403-1760a0e47505",
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
    ],
    tokyo: [
      "https://plus.unsplash.com/premium_photo-1661964177687-57387c2cbd14",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
      "https://images.unsplash.com/photo-1604928141064-207cea6f571f",
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989"
    ],
    paris: [
      "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
      "https://images.unsplash.com/photo-1549144511-f099e773c147"
    ],
    "new-york": [
      "https://plus.unsplash.com/premium_photo-1661954654458-c673671d4a08",
      "https://images.unsplash.com/photo-1496588152823-86ff7695e68f",
      "https://images.unsplash.com/photo-1541336032412-2048a678540d",
      "https://images.unsplash.com/photo-1543716091-a840c05249ec",
      "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7"
    ],
    switzerland: [
      "https://plus.unsplash.com/premium_photo-1689805586474-e59c51f38254",
      "https://images.unsplash.com/photo-1570161766218-f8488ebb8078",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95",
      "https://images.unsplash.com/photo-1594069758873-e79e9075eb7d",
      "https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5"
    ],
    hero: [
      "https://plus.unsplash.com/premium_photo-1676496046182-356a6a0ed002",
      "https://images.unsplash.com/photo-1537819191377-d3305ffddce4",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    ],
    fuji: [
      "https://images.unsplash.com/photo-1528164344705-47542687000d",
      "https://images.unsplash.com/photo-1570459027562-4a916cc6113f"
    ],
    globe: [
      "https://plus.unsplash.com/premium_photo-1681488277609-1806135d1126",
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2"
    ],
  };

  const lowerId = publicId.toLowerCase();
  
  // Simple hash to deterministically pick an image
  const hash = publicId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  let baseUrl = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"; // Generic landscape fallback
  let matched = false;

  // Find the first matching keyword
  for (const [key, urls] of Object.entries(idMap)) {
    if (lowerId.includes(key)) {
      baseUrl = urls[hash % urls.length] ?? baseUrl;
      matched = true;
      break;
    }
  }

  // No city-specific match (e.g. Tier 2 explore destinations): pick from the full pool
  // of curated images by hash so each card still gets a varied, real travel photo.
  if (!matched) {
    const pool = Object.values(idMap).flat();
    baseUrl = pool[hash % pool.length] ?? baseUrl;
  }

  return `${baseUrl}?q=80&w=${w}&h=${h}&auto=format&fit=crop`;
}

export const usingPlaceholderImages = !cloud;
