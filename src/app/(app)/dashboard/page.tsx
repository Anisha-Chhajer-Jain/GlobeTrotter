"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Map,
  Wallet,
  CheckCircle2,
  Globe2,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Compass,
  Plane,
  Clock,
  Layers,
  Search,
  ExternalLink,
  DollarSign,
  Sun,
  Moon,
  Sunset,
  Users,
  PieChart,
  Luggage,
  Heart,
} from "lucide-react";
import { dashboardApi } from "@/lib/api-client";
import {
  StatTile,
  EmptyState,
  Skeleton,
  StatTileSkeleton,
  CardSkeletonGrid,
  Badge,
} from "@/components/ui/Misc";
import TripCard from "@/components/TripCard";
import CityCard from "@/components/CityCard";
import WeatherBadge from "@/components/WeatherBadge";
import { formatMoney, formatDateRange, tripDurationDays } from "@/lib/format";
import { cn } from "@/lib/cn";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 18) return { text: "Good afternoon", icon: Sunset };
  return { text: "Good evening", icon: Moon };
}

function getCountdownDays(startDate?: string | null) {
  if (!startDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tripTab, setTripTab] = useState<"upcoming" | "past" | "shared">("upcoming");

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const GreetingIcon = greeting.icon;

  if (loading) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto pb-16">
        <Skeleton className="h-56 sm:h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatTileSkeleton key={i} />
          ))}
        </div>
        <div>
          <Skeleton className="h-7 w-48 mb-4 rounded-xl" />
          <CardSkeletonGrid />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Couldn't load dashboard"
        description="Please try refreshing the page."
        action={{
          label: "Refresh Page",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  const currency = data.userCurrency || "USD";
  const totalBudget = data.stats.totalBudget || 0;
  const totalSpent = data.stats.totalSpent || 0;
  const budgetUsedPct =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0;

  // Next immediate trip for spotlight banner
  const nextTrip = data.upcomingTrips?.[0] || null;
  const nextTripCountdown = nextTrip ? getCountdownDays(nextTrip.startDate) : null;
  const nextTripCity = nextTrip?.stops?.[0]?.city || null;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* 🌟 Grand Command Center Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white shadow-lift border border-white/10">
        {/* Ambient radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,0.22),transparent_40%),radial-gradient(circle_at_88%_85%,rgba(255,255,255,0.15),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Greeting & Summary */}
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider">
              <GreetingIcon className="w-3.5 h-3.5 text-teal-200" />
              <span>{greeting.text}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Traveler"}
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              You have{" "}
              <span className="font-bold text-white">
                {data.stats.totalTrips} planned journey{data.stats.totalTrips === 1 ? "" : "s"}
              </span>{" "}
              spanning{" "}
              <span className="font-bold text-white">
                {data.stats.citiesVisited} global destinations
              </span>
              . Ready for your next flight?
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-gray-900 font-bold text-xs sm:text-sm shadow-lg shadow-black/10 hover:bg-gray-50 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-primary-600 stroke-[3]" />
                <span>Plan New Trip</span>
              </Link>

              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4 text-teal-200" />
                <span>View Calendar</span>
              </Link>

              <Link
                href="/explore/cities"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all active:scale-95"
              >
                <Compass className="w-4 h-4 text-indigo-200" />
                <span>Explore Cities</span>
              </Link>
            </div>
          </div>

          {/* Right: Spotlight Next Adventure Card (if upcoming trip exists) */}
          {nextTrip ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 max-w-sm w-full shadow-2xl relative overflow-hidden group"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-400 text-teal-950 text-xs font-bold shadow-xs">
                  <Plane className="w-3.5 h-3.5 -rotate-45" />
                  <span>
                    {nextTripCountdown !== null && nextTripCountdown > 0
                      ? `Departs in ${nextTripCountdown} day${nextTripCountdown === 1 ? "" : "s"}`
                      : nextTripCountdown === 0
                      ? "Departs Today!"
                      : "Ongoing Journey"}
                  </span>
                </span>

                <span className="text-[11px] font-semibold text-white/80">
                  {tripDurationDays(nextTrip.startDate, nextTrip.endDate)} Days
                </span>
              </div>

              <h3 className="text-xl font-bold text-white font-display truncate group-hover:text-teal-200 transition-colors">
                {nextTrip.title}
              </h3>

              <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-300" />
                <span>{formatDateRange(nextTrip.startDate, nextTrip.endDate)}</span>
              </p>

              {nextTripCity && (
                <div className="mt-3.5 flex items-center justify-between p-2.5 rounded-2xl bg-white/10 border border-white/10">
                  <div className="flex items-center gap-2">
                    {nextTripCity.imageUrl ? (
                      <img
                        src={nextTripCity.imageUrl}
                        alt={nextTripCity.name}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-teal-500/30 flex items-center justify-center text-teal-200 font-bold text-xs">
                        <Map className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">
                        {nextTripCity.name}
                      </p>
                      <p className="text-[10px] text-white/70">
                        {nextTripCity.country}
                      </p>
                    </div>
                  </div>

                  <WeatherBadge
                    latitude={nextTripCity.latitude}
                    longitude={nextTripCity.longitude}
                  />
                </div>
              )}

              <Link
                href={`/trips/${nextTrip.id}`}
                className="mt-4 w-full py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-gray-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center shadow-xs"
              >
                <span>Open Next Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 max-w-sm w-full text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-teal-200 mx-auto">
                <Luggage className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No upcoming trips</h3>
              <p className="text-xs text-white/70">
                Plan your dream getaway and track flights, stays, and budgets effortlessly.
              </p>
              <Link
                href="/trips/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-400 text-teal-950 text-xs font-bold hover:bg-teal-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Start a Trip
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 💎 4 Elevated Stat & Financial Metrics Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trips */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-lift transition-all p-5 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-100 flex items-center justify-center text-primary-600 shrink-0 group-hover:scale-105 transition-transform">
            <Map className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Trips
            </p>
            <p className="text-2xl font-black text-gray-900 font-display mt-0.5">
              {data.stats.totalTrips}
            </p>
            <p className="text-[11px] text-gray-400">
              {data.stats.planningTrips} in planning
            </p>
          </div>
        </div>

        {/* Completed Trips */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-lift transition-all p-5 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Completed
            </p>
            <p className="text-2xl font-black text-gray-900 font-display mt-0.5">
              {data.stats.completedTrips}
            </p>
            <p className="text-[11px] text-gray-400">Memories collected</p>
          </div>
        </div>

        {/* Cities Visited */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-lift transition-all p-5 flex items-center gap-4 group">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
            <Globe2 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Destinations
            </p>
            <p className="text-2xl font-black text-gray-900 font-display mt-0.5">
              {data.stats.citiesVisited}
            </p>
            <p className="text-[11px] text-gray-400">Cities explored</p>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-lift transition-all p-5 flex flex-col justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Budget
              </p>
              <p className="text-lg font-black text-gray-900 font-display truncate">
                {formatMoney(totalBudget, currency)}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  budgetUsedPct >= 90
                    ? "bg-rose-500"
                    : budgetUsedPct >= 50
                    ? "bg-amber-500"
                    : "bg-indigo-600"
                )}
                style={{ width: `${budgetUsedPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
              <span>{budgetUsedPct}% utilized</span>
              <span>{formatMoney(totalSpent, currency)} spent</span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ Quick Launch Tools Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/trips/new"
          className="p-5 rounded-3xl bg-white border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-teal-200 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/25 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 font-display group-hover:text-primary-600 transition-colors">
                Plan Trip
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Multi-city</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          href="/wishlist"
          className="p-5 rounded-3xl bg-white border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-rose-200 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/25 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 font-display group-hover:text-rose-600 transition-colors">
                Wishlist
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Bucket list</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          href="/calendar"
          className="p-5 rounded-3xl bg-white border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-indigo-200 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 font-display group-hover:text-indigo-600 transition-colors">
                Calendar
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Horizon bars</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          href="/explore/cities"
          className="p-5 rounded-3xl bg-white border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-purple-200 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 font-display group-hover:text-purple-600 transition-colors">
                Explore
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">100+ cities</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          href="/community"
          className="p-5 rounded-3xl bg-white border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-amber-200 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/25 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-gray-900 font-display group-hover:text-amber-600 transition-colors">
                Community
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Stories & tips</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </div>

      {/* 🗺️ My Journeys Hub (Tabbed Section) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl">
              <button
                onClick={() => setTripTab("upcoming")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  tripTab === "upcoming"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <span>Upcoming Trips</span>
                <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.2 rounded-full">
                  {data.upcomingTrips?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setTripTab("past")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  tripTab === "past"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <span>Past Journeys</span>
                <span className="text-[10px] bg-gray-200 text-gray-700 font-bold px-1.5 py-0.2 rounded-full">
                  {data.pastTrips?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setTripTab("shared")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  tripTab === "shared"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <span>Shared With Me</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full">
                  {data.sharedWithMe?.length || 0}
                </span>
              </button>
            </div>
          </div>

          <Link
            href="/trips"
            className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:text-primary-800 transition-colors self-end sm:self-auto"
          >
            <span>View all in My Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tripTab === "upcoming" && (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {data.upcomingTrips.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-12 text-center">
                  <EmptyState
                    icon={Map}
                    title="No upcoming journeys scheduled"
                    description="You don't have any upcoming trips planned. Time to pick a dream destination!"
                    action={{
                      label: "Create a Trip",
                      onClick: () => (window.location.href = "/trips/new"),
                    }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.upcomingTrips.map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tripTab === "past" && (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {(!data.pastTrips || data.pastTrips.length === 0) ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-12 text-center">
                  <EmptyState
                    icon={CheckCircle2}
                    title="No past journeys yet"
                    description="Completed and past trips will automatically show up here as your travel archive."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.pastTrips.map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tripTab === "shared" && (
            <motion.div
              key="shared"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {(!data.sharedWithMe || data.sharedWithMe.length === 0) ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-12 text-center">
                  <EmptyState
                    icon={Users}
                    title="No shared trips"
                    description="Trips that friends or travel buddies share with you will appear here."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.sharedWithMe.map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 📊 Expense Category Breakdown & Travel Checklist */}
      {data.expenseByCategory?.length > 0 && (
        <section className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-display">
                  Expense & Budget Breakdown
                </h3>
                <p className="text-xs text-gray-500">
                  Track where your travel funds are allocated across categories.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {formatMoney(totalSpent, currency)} Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.expenseByCategory.map((cat: any) => (
              <div
                key={cat.category}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 capitalize">
                    {cat.category.toLowerCase()}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {cat.count} items
                  </span>
                </div>
                <p className="text-lg font-black text-gray-900 font-display">
                  {formatMoney(cat.total, currency)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🌆 Recommended Destinations Carousel / Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-display">
                Trending Destinations
              </h2>
              <p className="text-xs text-gray-500">
                Top rated cities with live weather and average travel cost index.
              </p>
            </div>
          </div>

          <Link
            href="/explore/cities"
            className="text-xs text-primary-600 font-bold flex items-center gap-1 hover:text-primary-800 transition-colors"
          >
            <span>Explore all cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.recommendedDestinations.slice(0, 4).map((city: any) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      </section>
    </div>
  );
}
