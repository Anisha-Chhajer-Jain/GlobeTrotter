import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { calculateTripBudget } from "@/lib/budget";

async function verifyTripAccess(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId === userId || trip.isPublic) return trip;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
  return trip;
}

/**
 * Standalone budget breakdown for a trip, without paginated expense rows.
 * Complements GET /api/trips/[tripId]/expenses, which returns the same
 * `budget` object alongside a page of expenses for the expense list UI.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripAccess(tripId, user.id);

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: { select: { id: true, name: true, country: true, imageUrl: true } },
            activities: { include: { activity: true } },
          },
        },
        expenses: true,
      },
    });

    if (!trip) throw new AppError("Trip not found", 404);

    const budget = calculateTripBudget(trip as any);
    return jsonResponse({ budget });
  } catch (error) {
    return handleApiError(error);
  }
}
