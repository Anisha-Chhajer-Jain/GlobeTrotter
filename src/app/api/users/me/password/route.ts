import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { hashPassword, verifyPassword, validatePasswordStrength } from "@/lib/auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = changePasswordSchema.parse(body);

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.password) {
      throw new AppError("No password set for this account", 400);
    }

    const isValid = await verifyPassword(data.currentPassword, dbUser.password);
    if (!isValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const strength = validatePasswordStrength(data.newPassword);
    if (!strength.valid) {
      throw new AppError(strength.errors.join(", "), 400);
    }

    const hashed = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return jsonResponse({ message: "Password changed successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
