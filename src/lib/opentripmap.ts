import { ActivityType } from "@prisma/client";

const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY || "5ae2e3f221c38a28845f05b6e79abc724804658c36be422cfde22092";
const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

export interface GeoCityResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
  population?: number;
}

export interface LivePlaceItem {
  xid: string;
  name: string;
  description?: string;
  kinds?: string;
  type: ActivityType;
  rating: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  previewUrl?: string;
  address?: string;
  wikipediaUrl?: string;
  costEstimate: number;
  durationMinutes: number;
}

/**
 * Geocode a city name to obtain latitude, longitude, and country.
 */
export async function geocodeCity(cityName: string): Promise<GeoCityResult | null> {
  if (!cityName || !OPENTRIPMAP_API_KEY) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/geoname?name=${encodeURIComponent(cityName)}&apikey=${OPENTRIPMAP_API_KEY}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== "OK" && !data.lat) return null;

    return {
      name: data.name || cityName,
      country: data.country || "",
      lat: Number(data.lat),
      lon: Number(data.lon),
      timezone: data.timezone,
      population: data.population,
    };
  } catch (error) {
    console.warn("[OpenTripMap] geocodeCity error:", error);
    return null;
  }
}

/**
 * Maps OpenTripMap categories/kinds to GlobeTrotter ActivityType enum.
 */
export function mapKindsToActivityType(kinds: string = ""): ActivityType {
  const k = kinds.toLowerCase();
  if (k.includes("food") || k.includes("restaurant") || k.includes("cafe") || k.includes("bar")) {
    return ActivityType.FOOD;
  }
  if (k.includes("museum") || k.includes("historic") || k.includes("cultural") || k.includes("art") || k.includes("monument")) {
    return ActivityType.CULTURE;
  }
  if (k.includes("natural") || k.includes("nature") || k.includes("park") || k.includes("beach") || k.includes("water")) {
    return ActivityType.NATURE;
  }
  if (k.includes("theatre") || k.includes("cinema") || k.includes("amusement") || k.includes("entertainment")) {
    return ActivityType.ENTERTAINMENT;
  }
  if (k.includes("shop") || k.includes("mall") || k.includes("market")) {
    return ActivityType.SHOPPING;
  }
  if (k.includes("sport") || k.includes("climbing") || k.includes("diving") || k.includes("hiking")) {
    return ActivityType.ADVENTURE;
  }
  return ActivityType.SIGHTSEEING;
}

/**
 * Fetch detailed information for a specific place by its OpenTripMap XID.
 */
export async function getPlaceDetails(xid: string): Promise<LivePlaceItem | null> {
  if (!xid || !OPENTRIPMAP_API_KEY) return null;

  try {
    const res = await fetch(`${BASE_URL}/xid/${encodeURIComponent(xid)}?apikey=${OPENTRIPMAP_API_KEY}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();

    const desc = data.wikipedia_extracts?.text || data.wikipedia_extracts?.html?.replace(/<[^>]+>/g, "") || "";
    const image = data.image || data.preview?.source || null;
    const addr = data.address
      ? [data.address.pedestrian, data.address.house_number, data.address.city, data.address.country]
          .filter(Boolean)
          .join(", ")
      : "";

    const rawRate = Number(data.rate) || 1;
    const normalizedRating = Math.min(5.0, Math.max(3.5, 3.5 + rawRate * 0.2));

    return {
      xid: data.xid,
      name: data.name || "Attraction",
      description: desc.length > 300 ? desc.slice(0, 300) + "..." : desc,
      kinds: data.kinds,
      type: mapKindsToActivityType(data.kinds),
      rating: parseFloat(normalizedRating.toFixed(1)),
      latitude: Number(data.point?.lat || 0),
      longitude: Number(data.point?.lon || 0),
      imageUrl: image,
      previewUrl: data.preview?.source || image,
      address: addr,
      wikipediaUrl: data.wikipedia,
      costEstimate: data.kinds?.includes("museums") ? 18 : data.kinds?.includes("historic") ? 12 : 0,
      durationMinutes: 90,
    };
  } catch (error) {
    console.warn("[OpenTripMap] getPlaceDetails error:", error);
    return null;
  }
}

/**
 * Search places around a city coordinate with optional text filter.
 */
export async function searchLivePlaces(options: {
  lat: number;
  lon: number;
  query?: string;
  radius?: number; // meters, default 15000
  limit?: number;  // default 10
}): Promise<LivePlaceItem[]> {
  const { lat, lon, query, radius = 15000, limit = 10 } = options;
  if (!OPENTRIPMAP_API_KEY) return [];

  try {
    let url: string;
    if (query && query.trim()) {
      url = `${BASE_URL}/autosuggest?name=${encodeURIComponent(query)}&radius=${radius}&lon=${lon}&lat=${lat}&limit=${limit}&format=json&apikey=${OPENTRIPMAP_API_KEY}`;
    } else {
      url = `${BASE_URL}/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=interesting_places,museums,historic,architecture,cultural,natural&limit=${limit}&format=json&apikey=${OPENTRIPMAP_API_KEY}`;
    }

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    // Filter valid places with a name
    const validItems = items.filter((item) => item.name && item.name.trim().length > 1).slice(0, limit);

    // Fetch details in parallel for the top items
    const placeDetails = await Promise.all(
      validItems.map(async (item) => {
        const detail = await getPlaceDetails(item.xid);
        if (detail) return detail;

        // Fallback minimal object if detail endpoint fails
        return {
          xid: item.xid,
          name: item.name,
          description: "Popular local attraction and point of interest.",
          kinds: item.kinds,
          type: mapKindsToActivityType(item.kinds),
          rating: 4.5,
          latitude: item.point?.lat || lat,
          longitude: item.point?.lon || lon,
          imageUrl: `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600`,
          costEstimate: 0,
          durationMinutes: 60,
        };
      })
    );

    return placeDetails.filter(Boolean) as LivePlaceItem[];
  } catch (error) {
    console.warn("[OpenTripMap] searchLivePlaces error:", error);
    return [];
  }
}
