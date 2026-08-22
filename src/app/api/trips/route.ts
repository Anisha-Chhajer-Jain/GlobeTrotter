import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, parsePagination } from "@/lib/errors";
import { createTripSchema, updateTripSchema } from "@/lib/validations";
import { generateShareToken } from "@/lib/auth";
import { TripStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePagination(searchParams);

    const statusFilter = searchParams.get("status") as TripStatus | null;
    const search = searchParams.get("search")?.toLowerCase();

    const where: any = {
      userId: user.id,
    };

    if (statusFilter && Object.values(TripStatus).includes(statusFilter)) {
      where.status = statusFilter;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          stops: {
            orderBy: { orderIndex: "asc" },
            include: {
              city: {
                select: { id: true, name: true, country: true, imageUrl: true },
              },
            },
          },
          expenses: { select: { id: true, amount: true, category: true } },
          _count: { select: { stops: true, shares: true, expenses: true } },
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return jsonResponse({
      trips,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createTripSchema.parse(body);

    const trip = await prisma.trip.create({
      data: {
        ...data,
        userId: user.id,
        shareToken: generateShareToken("trip"),
      },
      include: {
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: {
              select: { id: true, name: true, country: true, imageUrl: true },
            },
          },
        },
      },
    });

    return jsonResponse({ trip }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
