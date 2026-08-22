import { NextRequest } from "next/server";
import { geocodeCity, searchNearbyPlaces } from "@/lib/opentripmap";
import { handleApiError, jsonResponse } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const query = searchParams.get("query") || undefined;
    let lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    let lon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : null;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;

    let cityInfo = null;

    if ((lat === null || lon === null || isNaN(lat) || isNaN(lon)) && city) {
      cityInfo = await geocodeCity(city);
      if (cityInfo) {
        lat = cityInfo.lat;
        lon = cityInfo.lon;
      }
    }

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
      return jsonResponse({
        places: [],
        cityInfo: null,
        message: "Please provide a valid city name or lat/lon coordinates.",
      });
    }

    const places = await searchNearbyPlaces({
      lat,
      lon,
      query,
      limit,
      radiusMeters: 20000,
    });

    return jsonResponse({
      places,
      cityInfo: cityInfo || { lat, lon },
      total: places.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

