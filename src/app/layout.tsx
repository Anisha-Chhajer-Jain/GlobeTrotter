import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const display = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "GlobeTrotter - Multi-City Travel Planner",
  description: "Plan your multi-city adventures, manage itineraries, track budgets, and share trips with friends.",
  keywords: ["travel", "itinerary", "trip planner", "vacation", "budget", "GlobeTrotter"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased min-h-screen bg-warm-50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
