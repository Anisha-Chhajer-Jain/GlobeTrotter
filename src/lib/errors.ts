import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** Thrown by external API clients (OpenTripMap, GeoDB) when their key isn't configured. */
export class ExternalApiError extends Error {}

/**
 * Standard success envelope: { success: true, data }.
 */
export function jsonResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard failure envelope: { success: false, error }.
 *
 * `fieldErrors` is an additive, non-spec extra carried alongside `error` so
 * the frontend can highlight individual form fields on Zod validation
 * failures without breaking the { success, data?, error? } contract —
 * `error` always holds a single human-readable string on its own.
 */
function errorResponse(
  error: string,
  status: number,
  fieldErrors?: { field: string; message: string }[]
): NextResponse {
  return NextResponse.json(
    { success: false, error, ...(fieldErrors?.length ? { fieldErrors } : {}) },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof ExternalApiError) {
    return errorResponse(error.message, 503);
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    const summary = fieldErrors.map((f) => (f.field ? `${f.field}: ${f.message}` : f.message)).join("; ");
    return errorResponse(summary || "Validation failed", 400, fieldErrors);
  }

  // Prisma's own error codes are checked before falling back to fuzzy
  // message matching — that fallback previously misclassified some errors
  // because it depended on Prisma's error text staying stable.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return errorResponse(target ? `A record with this ${target} already exists` : "Record already exists", 409);
    }
    if (error.code === "P2025") {
      return errorResponse("Record not found", 404);
    }
    if (error.code === "P2003") {
      return errorResponse("Related record not found", 400);
    }
    return errorResponse("Database error", 500);
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("not found") || msg.includes("does not exist")) {
      return errorResponse(error.message, 404);
    }
    if (msg.includes("unauthorized") || msg.includes("not authenticated")) {
      return errorResponse(error.message, 401);
    }
    if (msg.includes("forbidden") || msg.includes("not allowed") || msg.includes("permission")) {
      return errorResponse(error.message, 403);
    }
    return errorResponse("Internal server error", 500);
  }

  return errorResponse("Something went wrong", 500);
}

export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function parseNumber(value: string | null, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const n = Number(value);
  return isNaN(n) ? defaultValue : n;
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseNumber(searchParams.get("page"), 1));
  const limit = Math.min(100, Math.max(1, parseNumber(searchParams.get("limit"), 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
