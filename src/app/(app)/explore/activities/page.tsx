"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import ActivitySearchPanel from "@/components/ActivitySearchPanel";

export default function ExploreActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" /> Explore Activities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Find things to do — sightseeing, food, adventure, and more.</p>
        </div>
        <Link href="/explore/cities" className="text-sm text-blue-600 font-medium hover:underline">
          Browse cities →
        </Link>
      </div>
      <ActivitySearchPanel />
    </div>
  );
}
