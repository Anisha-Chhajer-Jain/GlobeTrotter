import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, parsePagination } from "@/lib/errors";
import { searchActivitiesSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams);
    const validated = searchActivitiesSchema.parse(query);
    const { skip, limit } = parsePagination(searchParams);

    const where: Prisma.ActivityWhereInput = {};
    const OR: Prisma.ActivityWhereInput[] = [];

    if (validated.query) {
      OR.push({ name: { contains: validated.query, mode: "insensitive" } });
      OR.push({ description: { contains: validated.query, mode: "insensitive" } });
      OR.push({ location: { contains: validated.query, mode: "insensitive" } });
    }

    if (OR.length > 0) where.OR = OR;
    if (validated.cityId) where.cityId = validated.cityId;
    if (validated.type) where.type = validated.type;

    if (validated.minCost !== undefined || validated.maxCost !== undefined) {
      where.cost = {} as any;
      if (validated.minCost !== undefined) (where.cost as any).gte = validated.minCost;
      if (validated.maxCost !== undefined) (where.cost as any).lte = validated.maxCost;
    }

    if (validated.minDuration !== undefined || validated.maxDuration !== undefined) {
      where.duration = {};
      if (validated.minDuration !== undefined) where.duration.gte = validated.minDuration;
      if (validated.maxDuration !== undefined) where.duration.lte = validated.maxDuration;
    }

    if (validated.minRating !== undefined) {
      where.rating = { gte: validated.minRating as any };
    }

    let orderBy: Record<string, "asc" | "desc">;
    switch (validated.sortBy) {
      case "rating":
        orderBy = { rating: validated.sortOrder };
        break;
      case "cost":
        orderBy = { cost: validated.sortOrder };
        break;
      case "duration":
        orderBy = { duration: validated.sortOrder };
        break;
      case "name":
        orderBy = { name: validated.sortOrder };
        break;
      default:
        orderBy = { popularity: validated.sortOrder };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          city: { select: { id: true, name: true, country: true, imageUrl: true } },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    const types = await prisma.activity.groupBy({
      by: ["type"],
      _count: { type: true },
      orderBy: { _count: { type: "desc" } },
    });

    return jsonResponse({
      activities,
      types: types.map((t) => ({ type: t.type, count: t._count.type })),
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
