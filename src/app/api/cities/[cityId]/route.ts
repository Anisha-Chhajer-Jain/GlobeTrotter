import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, AppError, parsePagination } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params;
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        _count: { select: { activities: true, stops: true } },
        activities: {
          orderBy: { popularity: "desc" },
          take: 20,
        },
      },
    });

    if (!city) throw new AppError("City not found", 404);

    return jsonResponse({ city });
  } catch (error) {
    return handleApiError(error);
  }
}
