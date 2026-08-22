import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { createCommunityCommentSchema } from "@/lib/validations";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) throw new AppError("Post not found", 404);

    const body = await req.json();
    const { content } = createCommunityCommentSchema.parse(body);

    const comment = await prisma.communityComment.create({
      data: { postId: id, userId: user.id, content },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return jsonResponse({ comment }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
