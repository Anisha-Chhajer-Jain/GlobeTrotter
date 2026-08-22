"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Map, Wallet, CheckCircle2, Globe2, ArrowRight, TrendingUp } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <div className="relative h-40 sm:h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-end">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {session?.user?.name?.split(" ")[0] || "traveler"} 👋
            </h1>
            <p className="text-blue-100 text-sm mt-1">Here&apos;s what&apos;s happening with your travels.</p>
          </div>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" /> Plan New Trip
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Map} label="Total Trips" value={data.stats.totalTrips} tone="blue" />
        <StatTile icon={CheckCircle2} label="Completed" value={data.stats.completedTrips} tone="green" />
        <StatTile icon={Wallet} label="Total Budget" value={formatMoney(data.stats.totalBudget, currency)} tone="indigo" />
        <StatTile icon={Globe2} label="Cities Visited" value={data.stats.citiesVisited} tone="amber" />
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
