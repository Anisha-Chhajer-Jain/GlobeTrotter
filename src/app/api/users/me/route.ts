import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { updateProfileSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/auth";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account"),
});

export async function GET() {
  try {
    const user = await requireAuth();
    return jsonResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { ...data, email: data.email ? data.email.toLowerCase() : undefined },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        bio: true,
        phone: true,
        city: true,
        country: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return jsonResponse({ user: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Deletes the current user's account. Requires the account password in the
 * request body — irreversible, so we re-verify identity beyond just having
 * a valid session cookie, the same way a password change would.
 *
 * Trips owned by the user cascade-delete (stops, activities, expenses,
 * shares) via the schema's onDelete: Cascade rules. Expense and TripShare
 * rows the user created on trips they don't own have no cascade path from
 * User, so they're removed explicitly first to avoid a foreign-key
 * violation on the final user delete.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const { password } = deleteAccountSchema.parse(body);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.password || !(await verifyPassword(password, dbUser.password))) {
      throw new AppError("Incorrect password", 401);
    }

    await prisma.$transaction([
      prisma.expense.deleteMany({ where: { userId: user.id, trip: { userId: { not: user.id } } } }),
      prisma.tripShare.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    return jsonResponse({ message: "Account deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
