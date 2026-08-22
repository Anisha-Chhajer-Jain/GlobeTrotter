import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { shareTripSchema } from "@/lib/validations";

async function verifyOwner(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId !== userId) throw new AppError("Only trip owner can manage sharing", 403);
  return trip;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError("Trip not found", 404);
    if (trip.userId !== user.id) {
      const share = await prisma.tripShare.findFirst({
        where: { tripId, userId: user.id, accepted: true },
      });
      if (!share) throw new AppError("Permission denied", 403);
    }

    const shares = await prisma.tripShare.findMany({
      where: { tripId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return jsonResponse({
      isPublic: trip.isPublic,
      shareToken: trip.shareToken,
      publicUrl: trip.shareToken ? `/public/trips/${trip.shareToken}` : null,
      shares,
    });
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
    await verifyOwner(tripId, user.id);

    const body = await req.json();
    const data = shareTripSchema.parse(body);

    let targetUserId = data.userId;

    if (data.email && !targetUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (targetUser) {
        targetUserId = targetUser.id;
      }
    }

    if (!targetUserId) {
      return jsonResponse(
        { message: "User not found. They'll receive an invitation when they sign up." },
        200
      );
    }

    let share = await prisma.tripShare.findFirst({
      where: { tripId, userId: targetUserId },
    });

    if (share) {
      share = await prisma.tripShare.update({
        where: { id: share.id },
        data: {
          role: data.role,
          canEdit: data.canEdit || data.role === "EDITOR" || data.role === "OWNER",
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
    } else {
      share = await prisma.tripShare.create({
        data: {
          tripId,
          userId: targetUserId,
          email: data.email?.toLowerCase(),
          role: data.role,
          canEdit: data.canEdit || data.role === "EDITOR" || data.role === "OWNER",
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
    }

    return jsonResponse({ share }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
