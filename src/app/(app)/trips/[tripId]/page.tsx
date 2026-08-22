"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Pencil,
  Wallet,
  CalendarDays,
  Share2,
  MapPin,
  Clock,
  ArrowDown,
  Compass,
  Sparkles,
  Map as MapIcon,
  Layers,
  Calendar,
  DollarSign,
  Plus,
  Plane,
  ChevronRight,
  SunMedium,
  Luggage,
  FileText,
} from "lucide-react";
import { tripsApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import WeatherBadge from "@/components/WeatherBadge";
import TripRouteMap from "@/components/itinerary/TripRouteMap";
import TripExportReportModal from "@/components/itinerary/TripExportReportModal";
import { formatDateRange, formatDate, formatMoney, tripDurationDays } from "@/lib/format";
import { convertCurrency } from "@/lib/currency";
import { cn } from "@/lib/cn";

export default function ItineraryViewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"map" | "city" | "day">("map");
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    tripsApi
      .get(tripId)
      .then(({ trip }) => setTrip(trip))
      .catch(() => toast.error("Failed to load trip"))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner label="Loading your itinerary & route map..." />
      </div>
    );
  }

  if (!trip) {
    return (
      <EmptyState
        title="Trip not found"
        description="We couldn't find the requested trip itinerary."
        action={{
          label: "Back to My Trips",
          onClick: () => (window.location.href = "/trips"),
        }}
      />
    );
  }

  const allActivities = trip.stops.flatMap((stop: any) =>
    stop.activities.map((a: any) => ({ ...a, stop }))
  );

  const dayGroups = new Map<string, any[]>();
  for (const a of allActivities) {
    const key = a.scheduledDate ? formatDate(a.scheduledDate) : "Unscheduled";
    if (!dayGroups.has(key)) dayGroups.set(key, []);
    dayGroups.get(key)!.push(a);
  }

  const duration = tripDurationDays(trip.startDate, trip.endDate);
  const cover = trip.coverImage || trip.stops?.[0]?.city?.imageUrl;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 pb-20 print-hide">
        {/* Top Back Link */}
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My Trips</span>
        </Link>

      {/* 🌟 Signature Itinerary Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white shadow-lift border border-white/10">
        {cover && (
          <img
            src={cover}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <div className="relative z-10 p-6 sm:p-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title & Dates */}
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge
                  tone={
                    trip.status === "CONFIRMED"
                      ? "green"
                      : trip.status === "PLANNING"
                      ? "blue"
                      : trip.status === "COMPLETED"
                      ? "indigo"
                      : "gray"
                  }
                >
                  {trip.status}
                </Badge>
                {duration > 0 && (
                  <span className="text-xs font-bold text-teal-200 bg-white/15 px-3 py-0.5 rounded-full backdrop-blur-md">
                    {duration} Days Trip
                  </span>
                )}
                <span className="text-xs font-bold text-white/80 bg-white/10 px-3 py-0.5 rounded-full backdrop-blur-md">
                  {trip.stops?.length || 0} Destination{trip.stops?.length === 1 ? "" : "s"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display drop-shadow-md">
                {trip.title}
              </h1>

              <p className="text-sm text-teal-100/90 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-300" />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </p>

              {trip.description && (
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed pt-1">
                  {trip.description}
                </p>
              )}
            </div>

            {/* Quick Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
              <Link href={`/trips/${tripId}/build`}>
                <Button variant="secondary" size="sm" className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold shadow-md">
                  <Pencil className="w-3.5 h-3.5" /> Edit Stops
                </Button>
              </Link>

              <Link href={`/trips/${tripId}/calendar`}>
                <Button variant="outline" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl font-semibold backdrop-blur-md">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-200" /> Calendar
                </Button>
              </Link>

              <Link href={`/trips/${tripId}/budget`}>
                <Button variant="outline" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl font-semibold backdrop-blur-md">
                  <Wallet className="w-3.5 h-3.5 text-indigo-200" /> Budget
                </Button>
              </Link>

              <Link href={`/trips/${tripId}/packing`}>
                <Button variant="outline" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl font-semibold backdrop-blur-md">
                  <Luggage className="w-3.5 h-3.5 text-amber-300" /> Packing
                </Button>
              </Link>

              <Link href={`/trips/${tripId}/share`}>
                <Button variant="outline" size="sm" className="bg-white/15 hover:bg-white/25 text-white border-white/20 rounded-xl font-semibold backdrop-blur-md">
                  <Share2 className="w-3.5 h-3.5 text-rose-200" /> Share
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
                className="bg-teal-400 text-teal-950 hover:bg-teal-300 border-none rounded-xl font-bold shadow-md shadow-teal-950/20"
              >
                <FileText className="w-3.5 h-3.5" /> Export Report
              </Button>
            </div>
          </div>

          {/* Quick Route Stop Tags Bar */}
          {trip.stops?.length > 0 && (
            <div className="pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1 shrink-0">
                <Compass className="w-3.5 h-3.5" /> Route:
              </span>
              {trip.stops.map((stop: any, idx: number) => (
                <div key={stop.id} className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/15 text-xs font-bold text-white">
                    <span className="w-4 h-4 rounded-full bg-teal-400 text-teal-950 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span>{stop.city?.name}</span>
                  </span>
                  {idx < trip.stops.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🧭 View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <div className="flex items-center bg-gray-100/90 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setMode("map")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              mode === "map"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <MapIcon className="w-4 h-4 text-primary-600" />
            <span>Interactive Route Map</span>
          </button>

          <button
            onClick={() => setMode("city")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              mode === "city"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Stops & Activities</span>
          </button>

          <button
            onClick={() => setMode("day")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              mode === "day"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Day Timeline</span>
          </button>
        </div>

        <Link
          href={`/trips/${tripId}/build`}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-800"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stop / Activity</span>
        </Link>
      </div>

      {/* 🗺️ VIEW 1: INTERACTIVE ROUTE MAP */}
      {mode === "map" && (
        <div className="space-y-6">
          <TripRouteMap stops={trip.stops} tripTitle={trip.title} />

          {/* Quick Stops Grid under Map */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>Itinerary Destinations & Scheduled Stays</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trip.stops.map((stop: any, i: number) => (
                <div
                  key={stop.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 flex items-center gap-3.5 hover:shadow-lift transition-all"
                >
                  {stop.city?.imageUrl ? (
                    <img
                      src={stop.city.imageUrl}
                      alt={stop.city.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-sm shrink-0 border border-teal-100">
                      #{i + 1}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-gray-900 truncate">
                        {stop.city?.name}
                      </h4>
                      <WeatherBadge
                        latitude={stop.city?.latitude}
                        longitude={stop.city?.longitude}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {stop.city?.country} • {stop.activities?.length || 0} activities
                    </p>
                    <p className="text-[10px] text-teal-700 font-bold">
                      {formatDateRange(stop.arrivalDate, stop.departureDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🏙️ VIEW 2: BY CITY STOPS */}
      {mode === "city" && (
        <div className="space-y-6">
          {trip.stops.length === 0 ? (
            <EmptyState
              title="No stops planned yet"
              description="Start building this trip by adding your first destination city."
              action={{
                label: "Add Destination Stop",
                onClick: () => (window.location.href = `/trips/${tripId}/build`),
              }}
            />
          ) : (
            <div className="space-y-6">
              {trip.stops.map((stop: any, i: number) => (
                <div
                  key={stop.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden transition-all hover:shadow-lift"
                >
                  {/* Stop Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/70 via-white to-gray-50/70 gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-primary-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-teal-900/20">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                          <span>{stop.city?.name}</span>
                          <span className="text-xs font-semibold text-gray-400">({stop.city?.country})</span>
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          {formatDateRange(stop.arrivalDate, stop.departureDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <WeatherBadge
                        latitude={stop.city?.latitude}
                        longitude={stop.city?.longitude}
                      />
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-xl">
                        {stop.activities.length} Activit{stop.activities.length === 1 ? "y" : "ies"}
                      </span>
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="p-5 space-y-3">
                    {stop.activities.length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 text-center">
                        No activities scheduled for this stop yet. Click edit to add sights, dining, or tours.
                      </p>
                    ) : (
                      stop.activities.map((ta: any) => (
                        <div
                          key={ta.id}
                          className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200/60 transition-colors"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {ta.activity.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {ta.startTime && (
                                <span className="flex items-center gap-1 font-semibold text-teal-700">
                                  <Clock className="w-3 h-3" /> {ta.startTime}
                                  {ta.endTime ? ` - ${ta.endTime}` : ""}
                                </span>
                              )}
                              {ta.scheduledDate && (
                                <span>{formatDate(ta.scheduledDate)}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Badge tone="gray">{ta.activity.type}</Badge>
                            <span className="text-xs font-bold text-gray-900 bg-white px-2.5 py-1 rounded-xl border border-gray-200/80 shadow-2xs">
                              {formatMoney(ta.actualCost ?? ta.activity.cost, ta.activity.currency)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📅 VIEW 3: DAY-BY-DAY TIMELINE */}
      {mode === "day" && (
        <div className="space-y-6">
          {[...dayGroups.entries()].map(([day, items]) => {
            const dayTotal = items.reduce(
              (sum: number, ta: any) =>
                sum +
                convertCurrency(
                  Number(ta.actualCost ?? ta.activity.cost ?? 0),
                  ta.activity.currency,
                  trip.currency
                ),
              0
            );

            return (
              <div
                key={day}
                className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 font-extrabold text-base text-gray-900 flex items-center justify-between bg-gradient-to-r from-gray-50/60 via-white to-gray-50/60">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span>{day}</span>
                  </span>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    Day Total: {formatMoney(dayTotal, trip.currency)}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  {items.map((ta: any, i: number) => (
                    <div key={ta.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/60">
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {ta.activity.name}
                            <span className="font-normal text-gray-400 text-xs ml-2">
                              • {ta.stop.city?.name}
                            </span>
                          </p>
                          {ta.startTime && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 font-semibold">
                              <Clock className="w-3.5 h-3.5 text-teal-600" />
                              {ta.startTime}
                              {ta.endTime ? ` - ${ta.endTime}` : ""}
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-bold text-gray-900 bg-white px-3 py-1.5 rounded-xl border border-gray-200/80 shadow-2xs">
                          {formatMoney(
                            ta.actualCost ?? ta.activity.cost,
                            ta.activity.currency
                          )}
                        </span>
                      </div>

                      {i < items.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* 📄 Full Day-by-Day Export Report & Dossier Modal */}
      <TripExportReportModal
        trip={trip}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}
