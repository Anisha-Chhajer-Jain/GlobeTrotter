import { ActivityType } from "@prisma/client";
import { ExternalApiError } from "./errors";

const BASE_URL = "https://api.opentripmap.com/0.1/en/places";

function requireApiKey(): string {
  const key = process.env.OPENTRIPMAP_API_KEY;
  if (!key) throw new ExternalApiError("OPENTRIPMAP_API_KEY is not configured");
  return key;
}

export interface LivePlace {
  xid: string;
  name: string;
  description: string | null;
  type: ActivityType;
  rating: number;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  address: string | null;
  costEstimate: number;
  durationMinutes: number;
}

export interface GeoCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
  population?: number;
}


export async function geocodeCity(cityName: string): Promise<GeoCity | null> {
  const apiKey = requireApiKey();
  if (!cityName) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/geoname?name=${encodeURIComponent(cityName)}&apikey=${apiKey}`,
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
 * Maps OpenTripMap's free-text "kinds" tags to our ActivityType enum.
 */
export function mapKindsToActivityType(kinds: string = ""): ActivityType {
  const k = kinds.toLowerCase();
  if (k.includes("food") || k.includes("restaurant") || k.includes("cafe") || k.includes("bar")) return ActivityType.FOOD;
  if (k.includes("museum") || k.includes("historic") || k.includes("cultural") || k.includes("art") || k.includes("monument"))
    return ActivityType.CULTURE;
  if (k.includes("natural") || k.includes("nature") || k.includes("park") || k.includes("beach") || k.includes("water"))
    return ActivityType.NATURE;
  if (k.includes("theatre") || k.includes("cinema") || k.includes("amusement") || k.includes("entertainment"))
    return ActivityType.ENTERTAINMENT;
  if (k.includes("shop") || k.includes("mall") || k.includes("market")) return ActivityType.SHOPPING;
  if (k.includes("sport") || k.includes("climbing") || k.includes("diving") || k.includes("hiking")) return ActivityType.ADVENTURE;
  return ActivityType.SIGHTSEEING;
}

async function getPlaceDetails(xid: string, apiKey: string): Promise<LivePlace | null> {
  const res = await fetch(`${BASE_URL}/xid/${encodeURIComponent(xid)}?apikey=${apiKey}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.xid) return null;

  const rawDesc: string = data.wikipedia_extracts?.text || "";
  const rawRating = Number(data.rate) || 1;

  return {
    xid: data.xid,
    name: data.name || "Attraction",
    description: rawDesc ? (rawDesc.length > 300 ? `${rawDesc.slice(0, 300)}...` : rawDesc) : null,
    type: mapKindsToActivityType(data.kinds),
    rating: Math.round(Math.min(5, Math.max(3.5, 3.5 + rawRating * 0.2)) * 10) / 10,
    latitude: Number(data.point?.lat ?? 0),
    longitude: Number(data.point?.lon ?? 0),
    imageUrl: data.preview?.source || data.image || null,
    address: data.address
      ? [data.address.road, data.address.house_number, data.address.city, data.address.country].filter(Boolean).join(", ")
      : null,
    costEstimate: data.kinds?.includes("museums") ? 18 : data.kinds?.includes("historic") ? 12 : 0,
    durationMinutes: 90,
  };
}

/**
 * Finds real points of interest near a coordinate. Throws ExternalApiError
 * if the key is missing; returns [] (not an error) if OpenTripMap itself
 * has nothing nearby or is briefly unavailable, since that's a normal,
 * recoverable outcome for a discovery feature.
 */
export async function searchNearbyPlaces(options: {
  lat: number;
  lon: number;
  query?: string;
  radiusMeters?: number;
  limit?: number;
}): Promise<LivePlace[]> {
  const apiKey = requireApiKey();
  const { lat, lon, query, radiusMeters = 15000, limit = 12 } = options;

  const url = query?.trim()
    ? `${BASE_URL}/autosuggest?name=${encodeURIComponent(query)}&radius=${radiusMeters}&lon=${lon}&lat=${lat}&limit=${limit}&format=json&apikey=${apiKey}`
    : `${BASE_URL}/radius?radius=${radiusMeters}&lon=${lon}&lat=${lat}&kinds=interesting_places&limit=${limit}&format=json&apikey=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const items = await res.json();
  if (!Array.isArray(items)) return [];

  const candidates = items.filter((item) => item?.xid && item?.name?.trim()).slice(0, limit);
  const details = await Promise.all(candidates.map((item) => getPlaceDetails(item.xid, apiKey)));
  return details.filter((d): d is LivePlace => d !== null);
}
