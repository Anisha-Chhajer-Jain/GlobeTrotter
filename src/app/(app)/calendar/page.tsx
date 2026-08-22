"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { tripsApi } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TRIP_COLORS = ["bg-blue-100 text-blue-700", "bg-indigo-100 text-indigo-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-pink-100 text-pink-700"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AccountCalendarPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    tripsApi
      .list({ limit: 100 })
      .then((res) => setTrips(res.trips.filter((t: any) => t.startDate && t.endDate)))
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => {
    const first = startOfMonth(month);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return d;
    });
  }, [month]);

  const tripColor = useMemo(() => {
    const map = new Map<string, string>();
    trips.forEach((t, i) => map.set(t.id, TRIP_COLORS[i % TRIP_COLORS.length]));
    return map;
  }, [trips]);

  function tripsOnDay(day: Date) {
    return trips.filter((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const d = new Date(day);
      d.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  }

  if (loading) return <LoadingSpinner label="Loading your calendar..." />;

  const today = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" /> Calendar View
        </h1>
        <p className="text-gray-500 text-sm mt-1">All your trips, plotted across the month.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <button
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-gray-900">
            {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
          <button
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-50">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-xs font-semibold text-gray-400 py-2">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const inMonth = day.getMonth() === month.getMonth();
            const dayTrips = tripsOnDay(day);
            return (
              <div
                key={i}
                className={cn(
                  "min-h-[6.5rem] border-b border-r border-gray-50 p-1.5 last:border-r-0",
                  !inMonth && "bg-gray-50/50"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
                    !inMonth ? "text-gray-300" : sameDay(day, today) ? "bg-blue-600 text-white" : "text-gray-700"
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTrips.slice(0, 3).map((t) => (
                    <Link
                      key={t.id}
                      href={`/trips/${t.id}`}
                      className={cn("block truncate text-[10px] font-medium px-1.5 py-0.5 rounded", tripColor.get(t.id))}
                      title={t.title}
                    >
                      {t.title}
                    </Link>
                  ))}
                  {dayTrips.length > 3 && <p className="text-[10px] text-gray-400 px-1.5">+{dayTrips.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
