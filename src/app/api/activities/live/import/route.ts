import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { importActivitySchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = importActivitySchema.parse(body);

    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) throw new AppError("City not found", 404);

    const existing = await prisma.activity.findUnique({ where: { externalId: data.xid } });
    if (existing) {
      return jsonResponse({ activity: existing }, 200);
    }

    const activity = await prisma.activity.create({
      data: {
        externalId: data.xid,
        cityId: data.cityId,
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        rating: data.rating ?? undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        imageUrl: data.imageUrl || undefined,
        location: data.address || undefined,
        cost: data.costEstimate ?? 0,
        duration: data.durationMinutes ?? 60,
        currency: city.currency || "USD",
      },
    });

    return jsonResponse({ activity }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
