"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Wallet, CalendarDays, Share2, MapPin, Clock, ArrowDown, Luggage } from "lucide-react";
import { tripsApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { formatDateRange, formatDate, formatMoney } from "@/lib/format";
import { convertCurrency } from "@/lib/currency";

export default function ItineraryViewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"city" | "day">("city");

  useEffect(() => {
    tripsApi
      .get(tripId)
      .then(({ trip }) => setTrip(trip))
      .catch(() => toast.error("Failed to load trip"))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) return <LoadingSpinner label="Loading itinerary..." />;
  if (!trip) return <EmptyState title="Trip not found" />;

  const allActivities = trip.stops.flatMap((stop: any) =>
    stop.activities.map((a: any) => ({ ...a, stop }))
  );

  const dayGroups = new Map<string, any[]>();
  for (const a of allActivities) {
    const key = a.scheduledDate ? formatDate(a.scheduledDate) : "Unscheduled";
    if (!dayGroups.has(key)) dayGroups.set(key, []);
    dayGroups.get(key)!.push(a);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to trips
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatDateRange(trip.startDate, trip.endDate)}</p>
            {trip.description && <p className="text-sm text-gray-600 mt-2 max-w-xl">{trip.description}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/trips/${tripId}/build`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/calendar`}>
              <Button variant="outline" size="sm">
                <CalendarDays className="w-3.5 h-3.5" /> Calendar
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/budget`}>
              <Button variant="outline" size="sm">
                <Wallet className="w-3.5 h-3.5" /> Budget
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/packing`}>
              <Button variant="outline" size="sm">
                <Luggage className="w-3.5 h-3.5" /> Packing
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/share`}>
              <Button variant="outline" size="sm">
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode("city")}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${mode === "city" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
        >
          By City
        </button>
        <button
          onClick={() => setMode("day")}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${mode === "day" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600"}`}
        >
          By Day
        </button>
      </div>

      {trip.stops.length === 0 ? (
        <EmptyState title="No itinerary yet" description="This trip doesn't have any stops planned." />
      ) : mode === "city" ? (
        <div className="space-y-5">
          {trip.stops.map((stop: any, i: number) => (
            <div key={stop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" /> {stop.city?.name}, {stop.city?.country}
                  </h3>
                  <p className="text-xs text-gray-500">{formatDateRange(stop.arrivalDate, stop.departureDate)}</p>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {stop.activities.length === 0 ? (
                  <p className="text-sm text-gray-400">No activities planned for this stop.</p>
                ) : (
                  stop.activities.map((ta: any) => (
                    <div key={ta.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ta.activity.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          {ta.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {ta.startTime}
                              {ta.endTime ? ` - ${ta.endTime}` : ""}
                            </span>
                          )}
                          <span>{formatMoney(ta.actualCost ?? ta.activity.cost, ta.activity.currency)}</span>
                        </div>
                      </div>
                      <Badge tone="gray">{ta.activity.type}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {[...dayGroups.entries()].map(([day, items]) => {
            const dayTotal = items.reduce(
              (sum: number, ta: any) =>
                sum + convertCurrency(Number(ta.actualCost ?? ta.activity.cost ?? 0), ta.activity.currency, trip.currency),
              0
            );
            return (
              <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 font-bold text-gray-900">{day}</div>
                <div className="px-4 pt-3 grid grid-cols-[1fr_auto] gap-x-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <span>Physical Activity</span>
                  <span>Expense</span>
                </div>
                <div className="p-4 pt-2">
                  {items.map((ta: any, i: number) => (
                    <div key={ta.id}>
                      <div className="grid grid-cols-[1fr_auto] gap-x-4 items-center bg-gray-50 rounded-xl px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {ta.activity.name} <span className="font-normal text-gray-400">· {ta.stop.city?.name}</span>
                          </p>
                          {ta.startTime && (
                            <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                              <Clock className="w-3 h-3" /> {ta.startTime}
                              {ta.endTime ? ` - ${ta.endTime}` : ""}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          {formatMoney(ta.actualCost ?? ta.activity.cost, ta.activity.currency)}
                        </span>
                      </div>
                      {i < items.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="w-3.5 h-3.5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-[1fr_auto] gap-x-4 items-center px-3 pt-3 mt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">Day total</span>
                    <span className="text-sm font-bold text-primary-600 whitespace-nowrap">{formatMoney(dayTotal, trip.currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
