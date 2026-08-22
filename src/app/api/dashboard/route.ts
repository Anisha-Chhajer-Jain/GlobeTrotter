import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireAuth();
    const now = new Date();

    const [upcomingTrips, pastTrips, tripStats, expenseStats, cityStats] =
      await Promise.all([
        prisma.trip.findMany({
          where: {
            userId: user.id,
            status: { not: "CANCELLED" },
            OR: [
              { startDate: { gte: now } },
              {
                startDate: { lte: now },
                endDate: { gte: now },
              },
            ],
          },
          take: 5,
          orderBy: { startDate: "asc" },
          include: {
            stops: {
              take: 3,
              orderBy: { orderIndex: "asc" },
              include: {
                city: {
                  select: {
                    id: true,
                    name: true,
                    country: true,
                    imageUrl: true,
                  },
                },
              },
            },
            _count: { select: { stops: true, expenses: true } },
            expenses: { take: 50 },
          },
        }),
        prisma.trip.findMany({
          where: {
            userId: user.id,
            endDate: { lt: now },
          },
          take: 3,
          orderBy: { endDate: "desc" },
          include: {
            stops: {
              take: 3,
              orderBy: { orderIndex: "asc" },
              include: {
                city: { select: { id: true, name: true, country: true } },
              },
            },
          },
        }),
        prisma.trip.groupBy({
          by: ["status"],
          where: { userId: user.id },
          _count: { id: true },
          _sum: { budget: true },
        }),
        prisma.expense.groupBy({
          by: ["category"],
          where: { userId: user.id },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.tripStop.findMany({
          where: { trip: { userId: user.id } },
          distinct: ["cityId"],
          take: 10,
          include: {
            city: {
              select: { id: true, name: true, country: true, imageUrl: true },
            },
          },
        }),
      ]);

    const popularCities = await prisma.city.findMany({
      take: 10,
      orderBy: { popularity: "desc" },
      include: { _count: { select: { activities: true } } },
    });

    const sharedWithMe = await prisma.tripShare.findMany({
      where: { userId: user.id, accepted: true },
      take: 5,
      include: {
        trip: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            stops: {
              take: 2,
              include: {
                city: { select: { name: true, country: true, imageUrl: true } },
              },
            },
          },
        },
      },
    });

    const totalTrips = tripStats.reduce((acc, t) => acc + t._count.id, 0);
    const totalBudget = tripStats.reduce(
      (acc, t) => acc + (t._sum.budget?.toNumber() || 0),
      0,
    );
    const totalSpent = expenseStats.reduce(
      (acc, e) => acc + (e._sum.amount?.toNumber() || 0),
      0,
    );

    return jsonResponse({
      stats: {
        totalTrips,
        completedTrips:
          tripStats.find((t) => t.status === "COMPLETED")?._count.id || 0,
        planningTrips:
          tripStats.find((t) => t.status === "PLANNING" || t.status === "DRAFT")
            ?._count.id || 0,
        totalBudget,
        totalSpent,
        citiesVisited: cityStats.length,
      },
      upcomingTrips,
      pastTrips,
      sharedWithMe: sharedWithMe.map((s) => s.trip),
      popularCities,
      recommendedDestinations: popularCities.slice(0, 5),
      expenseByCategory: expenseStats.map((e) => ({
        category: e.category,
        total: e._sum.amount?.toNumber() || 0,
        count: e._count.id,
      })),
      userCurrency: user.currency,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
