import { NextRequest } from "next/server";
import { handleApiError, jsonResponse } from "@/lib/errors";
import { searchCities } from "@/lib/geodb";

/**
 * Live worldwide city search via the GeoDB Cities API — a supplement to the
 * locally seeded City catalog, not a replacement. Results here haven't been
 * persisted yet; POST /api/cities/live/import turns a chosen result into a
 * real City row the rest of the app can reference.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const cities = await searchCities(query, 10);
    return jsonResponse({ cities });
  } catch (error) {
    return handleApiError(error);
  }
}
