import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, parsePagination } from "@/lib/errors";
import { searchCitiesSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams);
    const validated = searchCitiesSchema.parse(query);
    const { skip, limit } = parsePagination(searchParams);

    const where: Prisma.CityWhereInput = {};
    const OR: Prisma.CityWhereInput[] = [];

    if (validated.query) {
      OR.push({ name: { contains: validated.query, mode: "insensitive" } });
      OR.push({ country: { contains: validated.query, mode: "insensitive" } });
      if (validated.query.includes(",")) {
        const parts = validated.query.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          OR.push({
            name: { contains: parts[0], mode: "insensitive" },
            country: { contains: parts[1], mode: "insensitive" },
          });
        }
      }
    }

    if (OR.length > 0) where.OR = OR;

    if (validated.country) {
      where.country = { contains: validated.country, mode: "insensitive" };
    }

    if (validated.minCostIndex !== undefined || validated.maxCostIndex !== undefined) {
      where.costIndex = {};
      if (validated.minCostIndex !== undefined) where.costIndex.gte = validated.minCostIndex;
      if (validated.maxCostIndex !== undefined) where.costIndex.lte = validated.maxCostIndex;
    }

    const orderBy: Record<string, "asc" | "desc"> = {
      [validated.sortBy]: validated.sortOrder,
    };

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: { select: { activities: true } },
        },
      }),
      prisma.city.count({ where }),
    ]);

    return jsonResponse({
      cities,
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
