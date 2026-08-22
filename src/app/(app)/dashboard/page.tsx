"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Map, Wallet, CheckCircle2, Globe2, ArrowRight, TrendingUp, Sparkles, Compass } from "lucide-react";
import { dashboardApi } from "@/lib/api-client";
import { StatTile, EmptyState, SkeletonCard } from "@/components/ui/Misc";
import TripCard from "@/components/TripCard";
import CityCard from "@/components/CityCard";
import { formatMoney } from "@/lib/format";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.get().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-fade-up">
        {/* Hero skeleton */}
        <div className="skeleton h-44 rounded-3xl" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={Compass}
        title="Couldn't load dashboard"
        description="Please try refreshing the page."
        action={
          <button onClick={() => window.location.reload()} className="btn-pill btn-primary px-5 py-2.5 text-sm text-white">
            Refresh
          </button>
        }
      />
    );
  }

  const currency = data.userCurrency || "INR";
  const budgetUsedPct =
    data.stats.totalBudget > 0
      ? Math.min(100, Math.round((data.stats.totalSpent / data.stats.totalBudget) * 100))
      : 0;
  const firstName = session?.user?.name?.split(" ")[0] || "traveler";

  return (
    <div className="space-y-10">

      {/* ─── Hero Banner ─────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden hero-gradient">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Your travel command center
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Welcome back, {firstName} ✈️
            </h1>
            <p className="text-blue-100/70 text-sm mt-2 max-w-md">
              Here&apos;s what&apos;s happening across your trips — all budgets in ₹ INR.
            </p>
          </div>
          <Link
            href="/trips/new"
            className="btn-pill btn-coral inline-flex items-center gap-2 px-5 py-3 text-sm text-white font-semibold w-fit shadow-lg"
          >
            <Plus className="w-4 h-4" /> Plan New Trip
          </Link>
        </div>
      </div>

      {/* ─── Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={Map}          label="Total Trips"     value={data.stats.totalTrips}     tone="blue"  />
        <StatTile icon={CheckCircle2} label="Completed"       value={data.stats.completedTrips} tone="green" />
        <StatTile icon={Globe2}       label="Cities Visited"  value={data.stats.citiesVisited}  tone="amber" />

        {/* Budget tile with progress bar */}
        <div className="card-premium p-5 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Budget</p>
              <p className="text-xl font-bold text-slate-900 truncate leading-tight">
                {formatMoney(data.stats.totalBudget, currency)}
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${budgetUsedPct >= 90 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{budgetUsedPct}% spent across all trips</p>
        </div>
      </div>

      {/* ─── Upcoming Trips ───────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Upcoming Trips</h2>
          <Link href="/trips" className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {data.upcomingTrips.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No upcoming trips yet"
            description="Start planning your next adventure with day-by-day itineraries and real-time ₹ budget tracking."
            action={
              <Link href="/trips/new" className="btn-pill btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white mt-2">
                <Plus className="w-4 h-4" /> Plan a trip
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

      {/* ─── Past Trips ──────────────────────────────────── */}
      {data.pastTrips?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-5">Previous Trips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pastTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Shared with me ──────────────────────────────── */}
      {data.sharedWithMe?.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-5">Shared With You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sharedWithMe.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Recommended Destinations ─────────────────────── */}
      {data.recommendedDestinations?.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Recommended Destinations
            </h2>
            <Link href="/explore/cities" className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.recommendedDestinations.map((city: any) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
