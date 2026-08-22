import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    name: "GlobeTrotter API",
    environment: process.env.NODE_ENV || "development",
  });
}
