import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updateActivitySchema } from "@/lib/validations";

/**
 * Flat resource routes for a single trip-activity entry, addressed directly
 * by its own id (no tripId/stopId required in the path). Ownership/edit
 * access is derived by walking tripActivity -> tripStop -> trip.
 */
async function loadTripActivityWithAccess(id: string, userId: string, needEdit: boolean) {
  const tripActivity = await prisma.tripActivity.findUnique({
    where: { id },
    include: { tripStop: { include: { trip: true } }, activity: true },
  });
  if (!tripActivity) throw new AppError("Trip activity not found", 404);

  const trip = tripActivity.tripStop.trip;
  if (trip.userId === userId) return tripActivity;

  const share = await prisma.tripShare.findFirst({
    where: { tripId: trip.id, userId, accepted: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
  if (needEdit && !share.canEdit) throw new AppError("Edit permission required", 403);
  return tripActivity;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const tripActivity = await loadTripActivityWithAccess(id, user.id, true);

    const body = await req.json();
    const data = updateActivitySchema.parse(body);
    const stopId = tripActivity.tripStopId;

    if (data.orderIndex !== undefined && data.orderIndex !== tripActivity.orderIndex) {
      const oldIdx = tripActivity.orderIndex;
      const newIdx = data.orderIndex;

      if (newIdx > oldIdx) {
        await prisma.tripActivity.updateMany({
          where: { tripStopId: stopId, orderIndex: { gt: oldIdx, lte: newIdx } },
          data: { orderIndex: { decrement: 1 } },
        });
      } else {
        await prisma.tripActivity.updateMany({
          where: { tripStopId: stopId, orderIndex: { gte: newIdx, lt: oldIdx } },
          data: { orderIndex: { increment: 1 } },
        });
      }
    }

    const updated = await prisma.tripActivity.update({
      where: { id },
      data,
      include: { activity: true },
    });

    return jsonResponse({ activity: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const tripActivity = await loadTripActivityWithAccess(id, user.id, true);

    await prisma.tripActivity.delete({ where: { id } });

    await prisma.tripActivity.updateMany({
      where: { tripStopId: tripActivity.tripStopId, orderIndex: { gt: tripActivity.orderIndex } },
      data: { orderIndex: { decrement: 1 } },
    });

    return jsonResponse({ message: "Activity removed from trip" });
  } catch (error) {
    return handleApiError(error);
  }
}
