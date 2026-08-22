import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { copyTripSchema } from "@/lib/validations";
import { generateShareToken } from "@/lib/auth";

/**
 * Copies a publicly shared trip (looked up by its share slug) into the
 * current authenticated user's account. Distinct from
 * POST /api/trips/[tripId]/copy, which requires already knowing the
 * internal trip id — this is the entry point for "Copy Trip" on the public
 * share page, where only the slug is known.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await requireAuth();

    const sourceTrip = await prisma.trip.findUnique({
      where: { shareToken: slug },
      include: {
        stops: { include: { activities: true } },
        expenses: true,
      },
    });

    if (!sourceTrip) throw new AppError("Trip not found or invalid share link", 404);
    if (!sourceTrip.isPublic) throw new AppError("This trip is not publicly accessible", 403);

    const body = await req.json().catch(() => ({}));
    const data = copyTripSchema.parse(body);

    const newTrip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: data.title ? data.title : `${sourceTrip.title} (Copy)`,
        description: sourceTrip.description,
        status: sourceTrip.status,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        budget: sourceTrip.budget,
        currency: sourceTrip.currency,
        coverImage: sourceTrip.coverImage,
        shareToken: generateShareToken("trip"),
      },
    });

    if (data.includeActivities) {
      for (const stop of sourceTrip.stops) {
        const newStop = await prisma.tripStop.create({
          data: {
            tripId: newTrip.id,
            cityId: stop.cityId,
            orderIndex: stop.orderIndex,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            notes: stop.notes,
          },
        });

        for (const activity of stop.activities) {
          await prisma.tripActivity.create({
            data: {
              tripStopId: newStop.id,
              activityId: activity.activityId,
              orderIndex: activity.orderIndex,
              scheduledDate: activity.scheduledDate,
              startTime: activity.startTime,
              endTime: activity.endTime,
              notes: activity.notes,
            },
          });
        }
      }
    }

    if (data.includeExpenses) {
      for (const exp of sourceTrip.expenses) {
        await prisma.expense.create({
          data: {
            tripId: newTrip.id,
            userId: user.id,
            title: exp.title,
            description: exp.description,
            amount: exp.amount,
            currency: exp.currency,
            category: exp.category,
            date: new Date(),
          },
        });
      }
    }

    const fullTrip = await prisma.trip.findUnique({
      where: { id: newTrip.id },
      include: {
        stops: {
          orderBy: { orderIndex: "asc" },
          include: { city: true, activities: { include: { activity: true } } },
        },
      },
    });

    return jsonResponse({ trip: fullTrip }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
