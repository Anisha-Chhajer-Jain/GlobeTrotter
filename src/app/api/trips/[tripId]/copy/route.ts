import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { copyTripSchema } from "@/lib/validations";
import { generateShareToken } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();

    const sourceTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            activities: true,
          },
        },
        expenses: true,
      },
    });

    if (!sourceTrip) throw new AppError("Trip not found", 404);

    if (sourceTrip.userId !== user.id && !sourceTrip.isPublic) {
      const share = await prisma.tripShare.findFirst({
        where: { tripId, userId: user.id, accepted: true },
      });
      if (!share) throw new AppError("Permission denied", 403);
    }

    const body = await req.json();
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
      const stopMap = new Map<string, string>();
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
        stopMap.set(stop.id, newStop.id);

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
