import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { createTripStopSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError("Trip not found", 404);
    if (trip.userId !== user.id && !trip.isPublic) {
      const share = await prisma.tripShare.findFirst({
        where: { tripId, userId: user.id, accepted: true },
      });
      if (!share) throw new AppError("Permission denied", 403);
    }

    const stops = await prisma.tripStop.findMany({
      where: { tripId },
      orderBy: { orderIndex: "asc" },
      include: {
        city: true,
        activities: {
          orderBy: { orderIndex: "asc" },
          include: { activity: true },
        },
      },
    });

    return jsonResponse({ stops });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError("Trip not found", 404);
    if (trip.userId !== user.id) {
      const share = await prisma.tripShare.findFirst({
        where: { tripId, userId: user.id, accepted: true, canEdit: true },
      });
      if (!share) throw new AppError("Permission denied", 403);
    }

    const body = await req.json();
    const data = createTripStopSchema.parse(body);

    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) throw new AppError("City not found", 404);

    const maxOrder = await prisma.tripStop.findFirst({
      where: { tripId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });

    const nextOrderIndex = data.orderIndex ?? (maxOrder ? maxOrder.orderIndex + 1 : 0);

    await prisma.tripStop.updateMany({
      where: { tripId, orderIndex: { gte: nextOrderIndex } },
      data: { orderIndex: { increment: 1 } },
    });

    const stop = await prisma.tripStop.create({
      data: {
        tripId,
        cityId: data.cityId,
        orderIndex: nextOrderIndex,
        arrivalDate: data.arrivalDate,
        departureDate: data.departureDate,
        notes: data.notes,
      },
      include: {
        city: true,
        activities: { include: { activity: true } },
      },
    });

    return jsonResponse({ stop }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
