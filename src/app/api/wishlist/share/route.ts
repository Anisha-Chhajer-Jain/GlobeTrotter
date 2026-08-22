import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const isPublic = body.isPublic !== undefined ? Boolean(body.isPublic) : true;

    // Find any existing token or generate new one
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: user.id, shareToken: { not: null } },
      select: { shareToken: true },
    });

    const token = existing?.shareToken || nanoid(12);

    // Update all user's wishlist items with public status & token
    await prisma.wishlistItem.updateMany({
      where: { userId: user.id },
      data: {
        isPublic,
        shareToken: token,
      },
    });

    return jsonResponse({
      token,
      isPublic,
      shareUrl: `/public/wishlist/${token}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
