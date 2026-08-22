import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, image: true } },
        trip: { select: { id: true, title: true } },
        city: { select: { id: true, name: true, country: true, imageUrl: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (!post) throw new AppError("Post not found", 404);

    let likedByViewer = false;
    try {
      const viewer = await requireAuth();
      likedByViewer = !!(await prisma.communityLike.findUnique({
        where: { postId_userId: { postId: id, userId: viewer.id } },
      }));
    } catch {
      likedByViewer = false;
    }

    return jsonResponse({ post: { ...post, likedByViewer } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw new AppError("Post not found", 404);
    if (post.userId !== user.id) throw new AppError("You can only delete your own posts", 403);

    await prisma.communityPost.delete({ where: { id } });
    return jsonResponse({ message: "Post deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
