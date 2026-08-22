import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

/**
 * Admin drill-down for a single user — their profile plus every trip they
 * own, so an admin can see "all the trips made by the user" per the
 * Manage Users screen, without exposing this to non-admin callers.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireAdmin();
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        city: true,
        country: true,
        currency: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);

    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { stops: true, expenses: true } },
      },
    });

    return jsonResponse({ user, trips });
  } catch (error) {
    return handleApiError(error);
  }
}
