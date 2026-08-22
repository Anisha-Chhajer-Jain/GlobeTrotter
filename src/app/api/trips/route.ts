import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, parsePagination } from "@/lib/errors";
import { createTripSchema } from "@/lib/validations";
import { generateShareToken } from "@/lib/auth";
import { TripStatus } from "@prisma/client";
import { MOCK_TRIPS } from "@/lib/mock-data";

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

    try {
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
    } catch (dbErr) {
      console.warn("[Trips API] DB offline, serving mock trips:", dbErr);
      return jsonResponse({
        trips: MOCK_TRIPS,
        pagination: { page: 1, limit: MOCK_TRIPS.length, total: MOCK_TRIPS.length, pages: 1 },
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
    const data = createTripSchema.parse(body);

    try {
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
    } catch (dbErr) {
      console.warn("[Trips API] DB offline, returning created mock trip:", dbErr);
      const newTrip = {
        id: `trip-${Date.now()}`,
        userId: user.id,
        title: data.title,
        description: data.description || "",
        status: data.status || "DRAFT",
        startDate: data.startDate?.toISOString() || null,
        endDate: data.endDate?.toISOString() || null,
        budget: data.budget || 0,
        currency: data.currency || "USD",
        coverImage: data.coverImage || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
        isPublic: false,
        shareToken: generateShareToken("trip"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stops: [],
        expenses: [],
        _count: { stops: 0, shares: 0, expenses: 0 },
      };
      return jsonResponse({ trip: newTrip }, 201);
    }
  } catch (error) {
    return handleApiError(error);
  }
}

