import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        city: {
          include: {
            _count: { select: { activities: true } },
          },
        },
      },
    });

    if (!activity) throw new AppError("Activity not found", 404);

    return jsonResponse({ activity });
  } catch (error) {
    return handleApiError(error);
  }
}
