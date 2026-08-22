import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updatePackingItemSchema } from "@/lib/validations";

async function loadItemWithAccess(tripId: string, itemId: string, userId: string) {
  const item = await prisma.packingItem.findUnique({ where: { id: itemId }, include: { trip: true } });
  if (!item || item.tripId !== tripId) throw new AppError("Packing item not found", 404);
  if (item.trip.userId === userId) return item;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true, canEdit: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
  return item;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const user = await requireAuth();
    await loadItemWithAccess(tripId, itemId, user.id);

    const body = await req.json();
    const data = updatePackingItemSchema.parse(body);

    const item = await prisma.packingItem.update({ where: { id: itemId }, data });
    return jsonResponse({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  try {
    const { tripId, itemId } = await params;
    const user = await requireAuth();
    await loadItemWithAccess(tripId, itemId, user.id);

    await prisma.packingItem.delete({ where: { id: itemId } });
    return jsonResponse({ message: "Packing item deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
