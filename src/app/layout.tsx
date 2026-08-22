import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "GlobeTrotter - Multi-City Travel Planner",
  description: "Plan your multi-city adventures, manage itineraries, track budgets, and share trips with friends.",
  keywords: ["travel", "itinerary", "trip planner", "vacation", "budget", "GlobeTrotter"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
