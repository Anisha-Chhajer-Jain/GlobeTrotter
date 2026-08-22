import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updateTripStopSchema, reorderStopsSchema } from "@/lib/validations";

async function verifyAccess(tripId: string, userId: string, needEdit = false) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId === userId) return;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
  if (needEdit && !share.canEdit && trip.userId !== userId) {
    throw new AppError("Edit permission required", 403);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; stopId: string }> }
) {
  try {
    const { tripId, stopId } = await params;
    const user = await requireAuth();
    await verifyAccess(tripId, user.id, true);

    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop || stop.tripId !== tripId) throw new AppError("Stop not found", 404);

    const body = await req.json();
    const data = updateTripStopSchema.parse(body);

    if (data.orderIndex !== undefined && data.orderIndex !== stop.orderIndex) {
      const oldIdx = stop.orderIndex;
      const newIdx = data.orderIndex;

      if (newIdx > oldIdx) {
        await prisma.tripStop.updateMany({
          where: { tripId, orderIndex: { gt: oldIdx, lte: newIdx } },
          data: { orderIndex: { decrement: 1 } },
        });
      } else {
        await prisma.tripStop.updateMany({
          where: { tripId, orderIndex: { gte: newIdx, lt: oldIdx } },
          data: { orderIndex: { increment: 1 } },
        });
      }
    }

    const updated = await prisma.tripStop.update({
      where: { id: stopId },
      data,
      include: {
        city: true,
        activities: {
          orderBy: { orderIndex: "asc" },
          include: { activity: true },
        },
      },
    });

    return jsonResponse({ stop: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; stopId: string }> }
) {
  try {
    const { tripId, stopId } = await params;
    const user = await requireAuth();
    await verifyAccess(tripId, user.id, true);

    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop || stop.tripId !== tripId) throw new AppError("Stop not found", 404);

    const deletedOrderIndex = stop.orderIndex;

    await prisma.tripStop.delete({ where: { id: stopId } });

    await prisma.tripStop.updateMany({
      where: { tripId, orderIndex: { gt: deletedOrderIndex } },
      data: { orderIndex: { decrement: 1 } },
    });

    return jsonResponse({ message: "Stop deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
