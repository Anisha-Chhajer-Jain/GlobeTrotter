import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const items = await prisma.wishlistItem.findMany({
      where: {
        shareToken: token,
        isPublic: true,
      },
      include: {
        city: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    if (!items || items.length === 0) {
      // Check if user has public items with this token
      const anyItem = await prisma.wishlistItem.findFirst({
        where: { shareToken: token },
        include: { user: { select: { id: true, name: true, image: true } } },
      });

      if (!anyItem) {
        throw new AppError("Wishlist not found or link is private", 404);
      }

      return jsonResponse({
        user: anyItem.user,
        items: [],
      });
    }

    const user = items[0].user;

    return jsonResponse({
      user,
      items,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
