import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError, parsePagination } from "@/lib/errors";
import { createExpenseSchema, updateExpenseSchema } from "@/lib/validations";
import { calculateTripBudget } from "@/lib/budget";

async function verifyTripAccess(tripId: string, userId: string, needEdit = false) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw new AppError("Trip not found", 404);
  if (trip.userId === userId) return trip;
  if (!needEdit && trip.isPublic) return trip;
  const share = await prisma.tripShare.findFirst({
    where: { tripId, userId, accepted: true },
  });
  if (!share) throw new AppError("Permission denied", 403);
  if (needEdit && !share.canEdit) throw new AppError("Edit permission required", 403);
  return trip;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripAccess(tripId, user.id);
    const { searchParams } = new URL(req.url);
    const { skip, limit } = parsePagination(searchParams);
    const category = searchParams.get("category");
    const tripStopId = searchParams.get("tripStopId");

    const where: any = { tripId };
    if (category) where.category = category;
    if (tripStopId) where.tripStopId = tripStopId;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const tripWithAll = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { orderIndex: "asc" },
          include: {
            city: { select: { id: true, name: true, country: true, imageUrl: true } },
            activities: { include: { activity: true } },
          },
        },
        expenses: true,
      },
    });

    const budget = tripWithAll ? calculateTripBudget(tripWithAll as any) : null;

    return jsonResponse({
      expenses,
      budget,
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const user = await requireAuth();
    await verifyTripAccess(tripId, user.id, true);

    const body = await req.json();
    const data = createExpenseSchema.parse(body);

    if (data.tripStopId) {
      const stop = await prisma.tripStop.findUnique({ where: { id: data.tripStopId } });
      if (!stop || stop.tripId !== tripId) {
        throw new AppError("Invalid trip stop ID", 400);
      }
    }

    const expense = await prisma.expense.create({
      data: {
        ...data,
        amount: data.amount as any,
        tripId,
        userId: user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return jsonResponse({ expense }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
