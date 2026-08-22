import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { searchNearbyPlaces } from "@/lib/opentripmap";

/**
 * Live points-of-interest discovery via OpenTripMap, scoped to a city
 * already in our catalog (its lat/lon anchor the search radius). Filters
 * out places already imported as Activity rows for that city, so "Discover
 * more" doesn't keep re-suggesting what's already addable from local data.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const query = searchParams.get("query") || undefined;
    if (!cityId) throw new AppError("cityId is required", 400);

    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new AppError("City not found", 404);
    if (!city.latitude || !city.longitude) {
      return jsonResponse({ activities: [] });
    }

    const [places, existing] = await Promise.all([
      searchNearbyPlaces({ lat: Number(city.latitude), lon: Number(city.longitude), query }),
      prisma.activity.findMany({ where: { cityId }, select: { externalId: true } }),
    ]);

    const importedXids = new Set(existing.map((a) => a.externalId).filter(Boolean));
    const fresh = places.filter((p) => !importedXids.has(p.xid));

    return jsonResponse({ activities: fresh });
  } catch (error) {
    return handleApiError(error);
  }
}
