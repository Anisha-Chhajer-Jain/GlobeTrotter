"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import CitySearchPanel from "@/components/CitySearchPanel";

export default function ExploreCitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" /> Explore Cities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Discover destinations for your next trip.</p>
        </div>
        <Link href="/explore/activities" className="text-sm text-blue-600 font-medium hover:underline">
          Browse activities →
        </Link>
      </div>
      <CitySearchPanel />
    </div>
  );
}
