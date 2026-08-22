"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Map, Wallet, CheckCircle2, Globe2, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { dashboardApi } from "@/lib/api-client";
import { StatTile, EmptyState } from "@/components/ui/Misc";
import { LoadingSpinner } from "@/components/ui/Misc";
import TripCard from "@/components/TripCard";
import CityCard from "@/components/CityCard";
import { formatMoney } from "@/lib/format";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;
  if (!data) return <EmptyState title="Couldn't load dashboard" description="Please try refreshing the page." />;

  const currency = data.userCurrency || "USD";
  const budgetUsedPct = data.stats.totalBudget > 0 ? Math.min(100, Math.round((data.stats.totalSpent / data.stats.totalBudget) * 100)) : 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.12),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Your travel command center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Welcome back, {session?.user?.name?.split(" ")[0] || "traveler"}
            </h1>
            <p className="text-blue-100 text-sm mt-2 max-w-md">Here&apos;s what&apos;s happening across your trips.</p>
          </div>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 shadow-lg transition-colors w-fit"
          >
            <Plus className="w-4 h-4" /> Plan New Trip
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Map} label="Total Trips" value={data.stats.totalTrips} tone="blue" />
        <StatTile icon={CheckCircle2} label="Completed" value={data.stats.completedTrips} tone="green" />
        <StatTile icon={Globe2} label="Cities Visited" value={data.stats.citiesVisited} tone="amber" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-500 truncate">Total Budget</p>
              <p className="text-lg font-bold text-gray-900 truncate">{formatMoney(data.stats.totalBudget, currency)}</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${budgetUsedPct >= 90 ? "bg-red-500" : "bg-indigo-500"}`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">{budgetUsedPct}% spent across all trips</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Trips</h2>
          <Link href="/trips" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {data.upcomingTrips.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No upcoming trips yet"
            description="Start planning your next adventure."
            action={
              <Link href="/trips/new" className="mt-2 text-sm text-blue-600 font-semibold hover:underline">
                Plan a trip →
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.upcomingTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {data.pastTrips?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Previous Trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pastTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {data.sharedWithMe?.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Shared With You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sharedWithMe.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> Recommended Destinations
          </h2>
          <Link href="/explore/cities" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
            Explore all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.recommendedDestinations.map((city: any) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      </section>
    </div>
  );
}
