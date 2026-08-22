import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { addActivitySchema, updateActivitySchema, reorderActivitiesSchema } from "@/lib/validations";

async function verifyTripEditAccess(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId === userId) return;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true, canEdit: true },
  });
  if (!share) throw new AppError("Edit permission required", 403);
}

async function verifyTripViewAccess(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId === userId || trip.isPublic) return;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; stopId: string }> }
) {
  try {
    const { tripId, stopId } = await params;
    const user = await requireAuth();
    await verifyTripViewAccess(tripId, user.id);

    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop || stop.tripId !== tripId) throw new AppError("Stop not found", 404);

    const activities = await prisma.tripActivity.findMany({
      where: { tripStopId: stopId },
      orderBy: { orderIndex: "asc" },
      include: { activity: true },
    });

    return jsonResponse({ activities });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; stopId: string }> }
) {
  try {
    const { tripId, stopId } = await params;
    const user = await requireAuth();
    await verifyTripEditAccess(tripId, user.id);

    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop || stop.tripId !== tripId) throw new AppError("Stop not found", 404);

    const body = await req.json();
    const data = addActivitySchema.parse(body);

    const activity = await prisma.activity.findUnique({ where: { id: data.activityId } });
    if (!activity) throw new AppError("Activity not found", 404);

    const maxOrder = await prisma.tripActivity.findFirst({
      where: { tripStopId: stopId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });

    const nextOrderIndex = data.orderIndex ?? (maxOrder ? maxOrder.orderIndex + 1 : 0);

    await prisma.tripActivity.updateMany({
      where: { tripStopId: stopId, orderIndex: { gte: nextOrderIndex } },
      data: { orderIndex: { increment: 1 } },
    });

    const tripActivity = await prisma.tripActivity.create({
      data: {
        tripStopId: stopId,
        activityId: data.activityId,
        orderIndex: nextOrderIndex,
        scheduledDate: data.scheduledDate,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        actualCost: data.actualCost as any,
      },
      include: { activity: true },
    });

    return jsonResponse({ activity: tripActivity }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
