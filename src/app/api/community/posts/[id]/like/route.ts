import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

/**
 * Toggles the current user's like on a post — one call flips it on or off,
 * so the frontend doesn't need separate like/unlike endpoints.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw new AppError("Post not found", 404);

    const existing = await prisma.communityLike.findUnique({
      where: { postId_userId: { postId: id, userId: user.id } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.communityLike.delete({ where: { id: existing.id } }),
        prisma.communityPost.update({ where: { id }, data: { likesCount: { decrement: 1 } } }),
      ]);
      return jsonResponse({ liked: false, likesCount: post.likesCount - 1 });
    }

    await prisma.$transaction([
      prisma.communityLike.create({ data: { postId: id, userId: user.id } }),
      prisma.communityPost.update({ where: { id }, data: { likesCount: { increment: 1 } } }),
    ]);
    return jsonResponse({ liked: true, likesCount: post.likesCount + 1 });
  } catch (error) {
    return handleApiError(error);
  }
}
