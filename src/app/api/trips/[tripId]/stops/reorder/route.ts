import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { reorderStopsSchema } from "@/lib/validations";

export async function PUT(
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
    const { stopIds } = reorderStopsSchema.parse(body);

    const txOps = stopIds.map((id, idx) =>
      prisma.tripStop.updateMany({
        where: { id, tripId },
        data: { orderIndex: idx },
      })
    );

    await prisma.$transaction(txOps);

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
