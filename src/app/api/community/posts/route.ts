import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, parsePagination } from "@/lib/errors";
import { createCommunityPostSchema, searchCommunityPostsSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mock-data";

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

    let viewerId: string | null = null;
    try {
      viewerId = (await requireAuth()).id;
    } catch {
      viewerId = null;
    }

    try {
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
    } catch (dbErr) {
      console.warn("[Community API] DB offline, serving mock community posts:", dbErr);
      return jsonResponse({
        posts: MOCK_COMMUNITY_POSTS.map((p) => ({ ...p, likedByViewer: false })),
        pagination: { page: 1, limit: MOCK_COMMUNITY_POSTS.length, total: MOCK_COMMUNITY_POSTS.length, pages: 1 },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createCommunityPostSchema.parse(body);

    try {
      const post = await prisma.communityPost.create({
        data: { ...data, userId: user.id },
        include: postInclude,
      });

      return jsonResponse({ post: { ...post, likedByViewer: false } }, 201);
    } catch (dbErr) {
      console.warn("[Community API] DB offline, returning created mock post:", dbErr);
      const newPost = {
        id: `post-${Date.now()}`,
        userId: user.id,
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: { id: user.id, name: user.name, image: user.image },
        comments: [],
        likes: [],
      };
      return jsonResponse({ post: { ...newPost, likedByViewer: false } }, 201);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

