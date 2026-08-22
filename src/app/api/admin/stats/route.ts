import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { handleApiError, jsonResponse } from "@/lib/errors";

/**
 * Platform-wide analytics, unscoped by userId — distinct from
 * GET /api/dashboard, which only ever returns the calling user's own data.
 * This is the actual "admin" resource: total users, trips across every
 * account, spend by category platform-wide, most-used cities, and basic
 * user/trip oversight lists.
 */
export async function GET() {
  try {
    await requireAdmin();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersLast30Days,
      totalTrips,
      tripsByStatus,
      expensesByCategory,
      topCities,
      topActivities,
      recentUsers,
      recentTrips,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.trip.count(),
      prisma.trip.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.expense.groupBy({ by: ["category"], _sum: { amount: true }, _count: { id: true } }),
      prisma.city.findMany({
        orderBy: { popularity: "desc" },
        take: 10,
        include: { _count: { select: { activities: true, stops: true } } },
      }),
      prisma.activity.findMany({
        orderBy: { tripActivities: { _count: "desc" } },
        take: 10,
        include: {
          city: { select: { name: true, country: true } },
          _count: { select: { tripActivities: true } },
        },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          currency: true,
          createdAt: true,
          _count: { select: { trips: true } },
        },
      }),
      prisma.trip.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { stops: true } },
        },
      }),
    ]);

    return jsonResponse({
      totalUsers,
      newUsersLast30Days,
      totalTrips,
      tripsByStatus: tripsByStatus.map((t) => ({ status: t.status, count: t._count.id })),
      expensesByCategory: expensesByCategory.map((e) => ({
        category: e.category,
        total: e._sum.amount?.toNumber() || 0,
        count: e._count.id,
      })),
      topCities: topCities.map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        popularity: c.popularity,
        activityCount: c._count.activities,
        timesAddedToTrips: c._count.stops,
      })),
      topActivities: topActivities.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        city: a.city,
        timesAddedToTrips: a._count.tripActivities,
      })),
      recentUsers,
      recentTrips: recentTrips.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        createdAt: t.createdAt,
        stopCount: t._count.stops,
        owner: t.user,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
