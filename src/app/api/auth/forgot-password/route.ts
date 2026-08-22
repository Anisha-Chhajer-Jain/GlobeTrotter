import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, jsonResponse } from "@/lib/errors";
import { forgotPasswordSchema } from "@/lib/validations";
import { generateId } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESET_IDENTIFIER_PREFIX = "reset-password:";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always respond the same way whether or not the account exists, so
    // this endpoint can't be used to enumerate registered emails.
    if (user) {
      const identifier = `${RESET_IDENTIFIER_PREFIX}${normalizedEmail}`;
      await prisma.verificationToken.deleteMany({ where: { identifier } });

      const token = generateId();
      await prisma.verificationToken.create({
        data: { identifier, token, expires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?email=${encodeURIComponent(
        normalizedEmail
      )}&token=${token}`;

      await sendEmail(
        normalizedEmail,
        "Reset your GlobeTrotter password",
        `Click the link below to reset your password (expires in 1 hour):\n${resetUrl}`
      );
    }

    return jsonResponse({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
