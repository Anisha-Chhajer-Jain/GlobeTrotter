import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: `${data.firstName} ${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        phone: data.phone || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        bio: data.bio || undefined,
        image: data.image || undefined,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        currency: true,
        createdAt: true,
      },
    });

    return jsonResponse({ user }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
