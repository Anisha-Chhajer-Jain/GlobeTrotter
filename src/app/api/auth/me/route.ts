import { getCurrentUser } from "@/lib/nextauth";
import { handleApiError, jsonResponse, AppError } from "@/lib/errors";

/**
 * Thin alias over GET /api/users/me, kept for clients that expect the
 * conventional "/auth/me" shape (mobile clients, API testing tools, etc).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("Not authenticated", 401);
    return jsonResponse({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
