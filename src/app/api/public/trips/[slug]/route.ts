import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { TripStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const trip = await prisma.trip.findUnique({
      where: { shareToken: slug },
      include: {
        user: { select: { id: true, name: true, image: true } },
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: true,
            activities: {
              orderBy: { orderIndex: "asc" },
              include: { activity: true },
            },
          },
        },
        expenses: {
          orderBy: { date: "desc" },
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        shares: {
          where: { accepted: true },
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (!trip) throw new AppError("Trip not found or invalid share link", 404);

    if (!trip.isPublic) {
      throw new AppError("This trip is not publicly accessible", 403);
    }

    return jsonResponse({
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        status: trip.status as TripStatus,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        currency: trip.currency,
        coverImage: trip.coverImage,
        isPublic: trip.isPublic,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
        user: trip.user,
        stops: trip.stops,
        expenses: trip.expenses,
        collaborators: trip.shares.map((s) => s.user),
      },
      isOwner: false,
      canEdit: false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
