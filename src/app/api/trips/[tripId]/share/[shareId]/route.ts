import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updateShareSchema } from "@/lib/validations";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; shareId: string }> },
) {
  try {
    const { tripId, shareId } = await params;
    const user = await requireAuth();

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError("Trip not found", 404);

    const share = await prisma.tripShare.findUnique({ where: { id: shareId } });
    if (!share || share.tripId !== tripId)
      throw new AppError("Share not found", 404);

    if (trip.userId !== user.id && share.userId !== user.id) {
      throw new AppError("Permission denied", 403);
    }

    const body = await req.json();
    const data = updateShareSchema.parse(body);

    if (data.accepted !== undefined && share.userId === user.id) {
      share.accepted = data.accepted;
      const updated = await prisma.tripShare.update({
        where: { id: shareId },
        data: {
          accepted: data.accepted,
          acceptedAt: data.accepted ? new Date() : null,
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });
      return jsonResponse({ share: updated });
    }

    if (trip.userId !== user.id) {
      throw new AppError("Only trip owner can modify share settings", 403);
    }

    const updated = await prisma.tripShare.update({
      where: { id: shareId },
      data: {
        ...data,
        canEdit:
          data.canEdit ?? (data.role === "EDITOR" || data.role === "OWNER"),
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return jsonResponse({ share: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; shareId: string }> },
) {
  try {
    const { tripId, shareId } = await params;
    const user = await requireAuth();

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError("Trip not found", 404);

    const share = await prisma.tripShare.findUnique({ where: { id: shareId } });
    if (!share || share.tripId !== tripId)
      throw new AppError("Share not found", 404);

    if (trip.userId !== user.id && share.userId !== user.id) {
      throw new AppError("Permission denied", 403);
    }

    await prisma.tripShare.delete({ where: { id: shareId } });
    return jsonResponse({ message: "Share removed successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
