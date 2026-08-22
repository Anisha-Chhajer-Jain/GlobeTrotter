import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const where: any = { userId: user.id };

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (priority && priority !== "ALL") {
      where.priority = parseInt(priority, 10);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { cityName: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.wishlistItem.findMany({
      where,
      include: {
        city: true,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return jsonResponse({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      throw new AppError("Title is required", 400);
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        title: body.title.trim(),
        category: body.category || "Destination",
        cityName: body.cityName?.trim() || null,
        country: body.country?.trim() || null,
        cityId: body.cityId || null,
        estimatedBudget: body.estimatedBudget != null && body.estimatedBudget !== "" ? parseFloat(body.estimatedBudget) : null,
        currency: (body.currency || "USD").toUpperCase().trim(),
        priority: body.priority ? parseInt(body.priority, 10) : 1,
        season: body.season?.trim() || null,
        notes: body.notes?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        shareToken: nanoid(12),
      },
      include: {
        city: true,
      },
    });

    return jsonResponse({ item }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
