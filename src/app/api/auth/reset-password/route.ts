import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { resetPasswordSchema } from "@/lib/validations";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";

const RESET_IDENTIFIER_PREFIX = "reset-password:";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = resetPasswordSchema.parse(body);
    const normalizedEmail = email.toLowerCase();
    const identifier = `${RESET_IDENTIFIER_PREFIX}${normalizedEmail}`;

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.identifier !== identifier) {
      throw new AppError("Invalid or expired reset link", 400);
    }
    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      throw new AppError("This reset link has expired. Please request a new one.", 400);
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      throw new AppError(strength.errors.join(", "), 400);
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new AppError("Invalid or expired reset link", 400);
    }

    const hashed = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    return jsonResponse({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return handleApiError(error);
  }
}
