import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse } from "@/lib/errors";
import { importCitySchema } from "@/lib/validations";

/**
 * Persists a GeoDB search result as a real City row (or returns the
 * existing one if this city was already imported), so it can be attached
 * to a trip like any seeded city. Requires auth to prevent anonymous
 * spam-writes to the shared city catalog.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = importCitySchema.parse(body);

    const existingByExternalId = await prisma.city.findUnique({ where: { externalId: data.geoDbId } });
    if (existingByExternalId) {
      return jsonResponse({ city: existingByExternalId }, 200);
    }

    // A seeded or previously manually-added city might already exist with
    // the same name/country but no externalId — reuse it instead of hitting
    // the (name, country, state) unique constraint with a duplicate.
    const existingByName = await prisma.city.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" }, country: { equals: data.country, mode: "insensitive" } },
    });
    if (existingByName) {
      const city = await prisma.city.update({ where: { id: existingByName.id }, data: { externalId: data.geoDbId } });
      return jsonResponse({ city }, 200);
    }

    const city = await prisma.city.create({
      data: {
        externalId: data.geoDbId,
        name: data.name,
        country: data.country,
        state: data.region || undefined,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone || undefined,
        popularity: data.population ? Math.min(100, Math.round(data.population / 100000)) : 0,
      },
    });

    return jsonResponse({ city }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
