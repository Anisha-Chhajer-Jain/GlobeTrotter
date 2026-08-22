import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { generateShareToken } from "@/lib/auth";

async function verifyOwner(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId !== userId)
    throw new AppError("Only trip owner can toggle public access", 403);
  return trip;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    const trip = await verifyOwner(tripId, user.id);
    const body = await req.json();
    const isPublic = body?.isPublic ?? !trip.isPublic;

    const shareToken = trip.shareToken ?? generateShareToken("trip");

    const updated = await prisma.trip.update({
      where: { id: tripId },
      data: { isPublic, shareToken },
    });

    return jsonResponse({
      isPublic: updated.isPublic,
      shareToken: updated.shareToken,
      publicUrl: updated.shareToken
        ? `/public/trips/${updated.shareToken}`
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
