import { getCurrentUser } from "./nextauth";
import { AppError } from "./errors";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Server-side admin gate. The frontend also checks NEXT_PUBLIC_ADMIN_EMAILS
 * for quick UI redirects, but that's cosmetic only — this is the actual
 * authorization boundary, since client-side env vars are visible to anyone.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new AppError("Authentication required", 401);

  const allowed = adminEmails();
  if (allowed.length === 0 || !allowed.includes(user.email.toLowerCase())) {
    throw new AppError("Admin access required", 403);
  }

  return user;
}
