import { ExternalApiError } from "./errors";

const BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo";

function requireApiKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new ExternalApiError("RAPIDAPI_KEY is not configured");
  return key;
}

export interface LiveCity {
  geoDbId: string;
  name: string;
  country: string;
  region: string | null;
  latitude: number;
  longitude: number;
  population: number | null;
  timezone: string | null;
}

/**
 * Searches the GeoDB Cities database (via RapidAPI) for real-world cities
 * beyond whatever's already seeded locally. Throws ExternalApiError if the
 * key is missing; returns [] if the upstream API has no matches or is
 * briefly unavailable.
 */
export async function searchCities(query: string, limit = 10): Promise<LiveCity[]> {
  const apiKey = requireApiKey();
  if (!query.trim()) return [];

  const res = await fetch(
    `${BASE_URL}/cities?namePrefix=${encodeURIComponent(query)}&limit=${limit}&sort=-population`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
      },
      next: { revalidate: 86400 },
    }
  );
  if (!res.ok) return [];

  const body = await res.json();
  if (!Array.isArray(body?.data)) return [];

  return body.data.map((c: any) => ({
    geoDbId: String(c.id),
    name: c.city || c.name,
    country: c.country,
    region: c.region || null,
    latitude: Number(c.latitude),
    longitude: Number(c.longitude),
    population: c.population ?? null,
    timezone: c.timezone || null,
  }));
}
