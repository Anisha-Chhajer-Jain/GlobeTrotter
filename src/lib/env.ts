import { z } from "zod";

/**
 * Validated at first import (pulled in by lib/prisma.ts, which every API
 * route touches) so a missing required variable fails fast with a clear
 * message instead of surfacing as a cryptic runtime error deep in a request.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
