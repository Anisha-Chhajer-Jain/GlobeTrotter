import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    const body = await req.json();

    const existing = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      throw new AppError("Wishlist item not found", 404);
    }

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.cityName !== undefined && { cityName: body.cityName?.trim() || null }),
        ...(body.country !== undefined && { country: body.country?.trim() || null }),
        ...(body.cityId !== undefined && { cityId: body.cityId || null }),
        ...(body.estimatedBudget !== undefined && {
          estimatedBudget: body.estimatedBudget != null && body.estimatedBudget !== "" ? parseFloat(body.estimatedBudget) : null,
        }),
        ...(body.currency !== undefined && { currency: body.currency.toUpperCase().trim() }),
        ...(body.priority !== undefined && { priority: parseInt(body.priority, 10) }),
        ...(body.season !== undefined && { season: body.season?.trim() || null }),
        ...(body.notes !== undefined && { notes: body.notes?.trim() || null }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl?.trim() || null }),
        ...(body.isPublic !== undefined && { isPublic: Boolean(body.isPublic) }),
      },
      include: {
        city: true,
      },
    });

    return jsonResponse({ item: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const existing = await prisma.wishlistItem.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      throw new AppError("Wishlist item not found", 404);
    }

    await prisma.wishlistItem.delete({
      where: { id },
    });

    return jsonResponse({ success: true, message: "Item deleted from wishlist" });
  } catch (error) {
    return handleApiError(error);
  }
}
