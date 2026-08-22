import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updateTripSchema } from "@/lib/validations";

async function verifyTripOwnership(tripId: string, userId: string, allowPublic = false) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    throw new AppError("Trip not found", 404);
  }

  if (trip.userId === userId) return trip;

  if (allowPublic && trip.isPublic) return trip;

  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true },
  });

  if (share) return trip;

  throw new AppError("You do not have permission to access this trip", 403);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripOwnership(tripId, user.id, true);

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: { select: { id: true, name: true, image: true, email: true } },
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: true,
            activities: {
              orderBy: { orderIndex: "asc" },
              include: { activity: true },
            },
          },
        },
        expenses: {
          orderBy: { date: "desc" },
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        shares: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
      },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    return jsonResponse({ trip });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripOwnership(tripId, user.id);

    const body = await req.json();
    const data = updateTripSchema.parse(body);

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data,
      include: {
        stops: {
          orderBy: { orderIndex: "asc" },
          include: { city: { select: { id: true, name: true, country: true, imageUrl: true } } },
        },
      },
    });

    return jsonResponse({ trip: updatedTrip });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripOwnership(tripId, user.id);

    await prisma.trip.delete({ where: { id: tripId } });

    return jsonResponse({ message: "Trip deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
