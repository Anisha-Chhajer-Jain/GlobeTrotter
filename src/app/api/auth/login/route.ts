import { NextRequest } from "next/server";
import { encode } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";
import { loginSchema } from "@/lib/validations";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days, matches authOptions.session.maxAge

/**
 * REST-style login for non-browser clients (mobile apps, Postman, API
 * testing). Manually issues the same NextAuth JWT session cookie that the
 * credentials provider issues, using next-auth/jwt's encode() with the
 * shared NEXTAUTH_SECRET — so a session created here is also readable by
 * getServerSession()/useSession() on the browser side.
 *
 * The web frontend itself continues to use next-auth/react's signIn(),
 * which exercises the same credential-verification logic via the
 * CredentialsProvider in src/lib/nextauth.ts — this route is an additional,
 * equivalent entry point, not a replacement.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const secure = process.env.NODE_ENV === "production";
    const cookieName = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";

    const token = await encode({
      token: {
        sub: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.image,
        currency: user.currency,
      },
      secret: process.env.NEXTAUTH_SECRET!,
      maxAge: SESSION_MAX_AGE,
    });

    const response = jsonResponse({
      user: { id: user.id, name: user.name, email: user.email, image: user.image, currency: user.currency },
    });

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
