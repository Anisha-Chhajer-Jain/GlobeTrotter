import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const BASE_CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Accept-Language",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

/**
 * In dev, allow any origin for convenience. In production, only echo back an
 * explicitly allowlisted origin (via ALLOWED_ORIGINS, comma-separated) — a
 * bare "*" combined with credentialed requests is both meaningless to
 * browsers and overly permissive as a default. Same-origin calls from the
 * app's own frontend work regardless, since CORS headers only gate
 * cross-origin browser requests.
 */
function resolveCorsHeaders(requestOrigin: string | null): Record<string, string> {
  if (process.env.NODE_ENV !== "production") {
    return { ...BASE_CORS_HEADERS, "Access-Control-Allow-Origin": "*" };
  }

  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (requestOrigin && allowed.includes(requestOrigin)) {
    return { ...BASE_CORS_HEADERS, "Access-Control-Allow-Origin": requestOrigin, Vary: "Origin" };
  }

  return { ...BASE_CORS_HEADERS };
}

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/public/trips/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const corsHeaders = resolveCorsHeaders(request.headers.get("origin"));

    if (request.method === "OPTIONS") {
      return new NextResponse(null, { headers: corsHeaders });
    }

    const ip = getClientIp(request);
    const isAuthEndpoint = pathname.startsWith("/api/auth") || pathname === "/api/users/me/password";
    const limit = isAuthEndpoint
      ? rateLimit(`auth:${ip}`, 10, 60_000) // 10 req/min for auth-sensitive endpoints
      : rateLimit(`api:${ip}`, 120, 60_000); // 120 req/min general API traffic

    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
    return response;
  }

  if (!isPublicPath(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
