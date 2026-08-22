import { NextResponse } from "next/server";
import { jsonResponse } from "@/lib/errors";

const SESSION_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

/**
 * Server-side logout for non-browser/API clients. Browser clients using the
 * SessionProvider should prefer next-auth/react's signOut(), which also
 * clears client-side session state; this route exists so API-only consumers
 * (mobile apps, curl, Postman) have a way to invalidate their session cookie
 * without going through the client SDK.
 */
export async function POST() {
  const response = jsonResponse({ message: "Logged out successfully" });
  for (const name of SESSION_COOKIE_NAMES) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }
  return response;
}
