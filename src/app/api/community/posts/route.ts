import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, parsePagination } from "@/lib/errors";
import { createCommunityPostSchema, searchCommunityPostsSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

const postInclude = {
  user: { select: { id: true, name: true, image: true } },
  trip: { select: { id: true, title: true } },
  city: { select: { id: true, name: true, country: true, imageUrl: true } },
  _count: { select: { comments: true } },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const validated = searchCommunityPostsSchema.parse(Object.fromEntries(searchParams));
    const { skip, limit } = parsePagination(searchParams);

    const where: Prisma.CommunityPostWhereInput = {};
    if (validated.query) {
      where.OR = [
        { title: { contains: validated.query, mode: "insensitive" } },
        { content: { contains: validated.query, mode: "insensitive" } },
      ];
    }
    if (validated.cityId) where.cityId = validated.cityId;

    const orderBy: Prisma.CommunityPostOrderByWithRelationInput =
      validated.sortBy === "popular" ? { likesCount: "desc" } : { createdAt: "desc" };

    // Best-effort: attach whether the current viewer liked each post, without
    // requiring auth to browse the feed.
    let viewerId: string | null = null;
    try {
      viewerId = (await requireAuth()).id;
    } catch {
      viewerId = null;
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: postInclude,
      }),
      prisma.communityPost.count({ where }),
    ]);

    let likedPostIds = new Set<string>();
    if (viewerId && posts.length > 0) {
      const likes = await prisma.communityLike.findMany({
        where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    return jsonResponse({
      posts: posts.map((p) => ({ ...p, likedByViewer: likedPostIds.has(p.id) })),
      pagination: { page: Math.floor(skip / limit) + 1, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createCommunityPostSchema.parse(body);

    const post = await prisma.communityPost.create({
      data: { ...data, userId: user.id },
      include: postInclude,
    });

    return jsonResponse({ post: { ...post, likedByViewer: false } }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
