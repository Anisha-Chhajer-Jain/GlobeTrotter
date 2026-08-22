import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { createPackingItemSchema } from "@/lib/validations";

async function verifyTripAccess(tripId: string, userId: string, needEdit = false) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId === userId) return trip;
  if (!needEdit && trip.isPublic) return trip;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
  if (needEdit && !share.canEdit) throw new AppError("Edit permission required", 403);
  return trip;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripAccess(tripId, user.id);

    const items = await prisma.packingItem.findMany({
      where: { tripId },
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });

    return jsonResponse({ items });
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
    await verifyTripAccess(tripId, user.id, true);

    const body = await req.json();
    const data = createPackingItemSchema.parse(body);

    const item = await prisma.packingItem.create({
      data: { ...data, tripId },
    });

    return jsonResponse({ item }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
