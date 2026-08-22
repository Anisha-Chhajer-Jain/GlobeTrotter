"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  Sparkles,
  Plane,
  Compass,
  DollarSign,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  X,
  Eye,
  SlidersHorizontal,
  Flame,
  SunMedium,
  ExternalLink,
  ChevronDown,
  Navigation,
  Globe2,
} from "lucide-react";
import { tripsApi } from "@/lib/api-client";
import { LoadingSpinner, Badge, EmptyState } from "@/components/ui/Misc";
import WeatherBadge from "@/components/WeatherBadge";
import Button from "@/components/ui/Button";
import { formatDate, formatDateRange, formatMoney, tripDurationDays } from "@/lib/format";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Rich aesthetic color schemes for trips
const TRIP_THEMES = [
  {
    id: "teal",
    name: "Emerald Coast",
    bar: "bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 text-white shadow-sm shadow-teal-900/20",
    pill: "bg-teal-50 text-teal-800 border-teal-200",
    badge: "bg-teal-500",
    text: "text-teal-700",
    glow: "rgba(20, 184, 166, 0.2)",
    accent: "border-teal-500",
  },
  {
    id: "indigo",
    name: "Indigo Horizon",
    bar: "bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500 text-white shadow-sm shadow-indigo-900/20",
    pill: "bg-indigo-50 text-indigo-800 border-indigo-200",
    badge: "bg-indigo-500",
    text: "text-indigo-700",
    glow: "rgba(99, 102, 241, 0.2)",
    accent: "border-indigo-500",
  },
  {
    id: "rose",
    name: "Sunset Coral",
    bar: "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-sm shadow-rose-900/20",
    pill: "bg-rose-50 text-rose-800 border-rose-200",
    badge: "bg-rose-500",
    text: "text-rose-700",
    glow: "rgba(244, 63, 94, 0.2)",
    accent: "border-rose-500",
  },
  {
    id: "purple",
    name: "Royal Violet",
    bar: "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-500 text-white shadow-sm shadow-purple-900/20",
    pill: "bg-purple-50 text-purple-800 border-purple-200",
    badge: "bg-purple-500",
    text: "text-purple-700",
    glow: "rgba(168, 85, 247, 0.2)",
    accent: "border-purple-500",
  },
  {
    id: "sky",
    name: "Azure Sky",
    bar: "bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-500 text-white shadow-sm shadow-sky-900/20",
    pill: "bg-sky-50 text-sky-800 border-sky-200",
    badge: "bg-sky-500",
    text: "text-sky-700",
    glow: "rgba(14, 165, 233, 0.2)",
    accent: "border-sky-500",
  },
  {
    id: "amber",
    name: "Golden Sahara",
    bar: "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white shadow-sm shadow-amber-900/20",
    pill: "bg-amber-50 text-amber-900 border-amber-200",
    badge: "bg-amber-500",
    text: "text-amber-700",
    glow: "rgba(245, 158, 11, 0.2)",
    accent: "border-amber-500",
  },
];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AccountCalendarPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [activeTripModal, setActiveTripModal] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "agenda" | "year">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    tripsApi
      .list({ limit: 100 })
      .then((res) => {
        const validTrips = (res?.trips || []).filter(
          (t: any) => t.startDate && t.endDate
        );
        setTrips(validTrips);
      })
      .catch((err) => {
        console.error("Failed to load trips for calendar:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtered trips based on search & status
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.stops?.some((s: any) =>
          s.city?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "ALL" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchQuery, statusFilter]);

  // Color mappings for trips
  const tripThemeMap = useMemo(() => {
    const map = new Map<string, (typeof TRIP_THEMES)[0]>();
    trips.forEach((t, i) => {
      map.set(t.id, TRIP_THEMES[i % TRIP_THEMES.length]);
    });
    return map;
  }, [trips]);

  // 6 weeks (42 days) grid
  const weeks = useMemo(() => {
    const first = startOfMonth(month);
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - first.getDay());

    const result = [];
    for (let w = 0; w < 6; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + w * 7 + d);
        weekDays.push(date);
      }
      result.push(weekDays);
    }
    return result;
  }, [month]);

  // Helper to query trips active on a day
  function getTripsOnDay(day: Date, tripList = filteredTrips) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const dayMs = d.getTime();

    return tripList.filter((t) => {
      const start = new Date(t.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(t.endDate);
      end.setHours(0, 0, 0, 0);
      return dayMs >= start.getTime() && dayMs <= end.getTime();
    });
  }

  // Calculate high-level month stats
  const monthStats = useMemo(() => {
    const first = startOfMonth(month);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const monthStartMs = first.getTime();
    const monthEndMs = last.getTime();

    const tripsInMonth = trips.filter((t) => {
      const s = new Date(t.startDate).getTime();
      const e = new Date(t.endDate).getTime();
      return s <= monthEndMs && e >= monthStartMs;
    });

    let travelDaysCount = 0;
    for (let day = 1; day <= last.getDate(); day++) {
      const cur = new Date(month.getFullYear(), month.getMonth(), day);
      if (getTripsOnDay(cur, trips).length > 0) {
        travelDaysCount++;
      }
    }

    const uniqueDestinations = new Set<string>();
    tripsInMonth.forEach((t) => {
      t.stops?.forEach((s: any) => {
        if (s.city?.name) uniqueDestinations.add(s.city.name);
      });
    });

    // Upcoming trip countdown
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const upcomingTrips = trips
      .map((t) => ({ ...t, startMs: new Date(t.startDate).getTime() }))
      .filter((t) => t.startMs >= todayMs)
      .sort((a, b) => a.startMs - b.startMs);

    const nextTrip = upcomingTrips[0] || null;
    let nextTripDays = null;
    if (nextTrip) {
      nextTripDays = Math.max(
        0,
        Math.round((nextTrip.startMs - todayMs) / (1000 * 60 * 60 * 24))
      );
    }

    return {
      tripsInMonth: tripsInMonth.length,
      travelDays: travelDaysCount,
      destinationsCount: uniqueDestinations.size,
      nextTrip,
      nextTripDays,
    };
  }, [month, trips]);

  const today = new Date();
  const selectedDayTrips = useMemo(() => {
    return getTripsOnDay(selectedDay, trips);
  }, [selectedDay, trips]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner label="Preparing your interactive travel calendar..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* 🌟 Signature GlobeTrotter Curved Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white shadow-lift">
        {/* Ambient radial glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.22),transparent_40%),radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.14),transparent_40%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
                <span>Interactive Travel Horizon</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                Travel Calendar & Schedule
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-1.5 max-w-xl">
                Plot your departures, track multi-day journeys, and schedule new adventures across the globe.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const now = new Date();
                  setMonth(startOfMonth(now));
                  setSelectedDay(now);
                }}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4 text-teal-200" />
                <span>Jump to Today</span>
              </button>

              <Link
                href={`/trips/new?startDate=${formatIsoDate(selectedDay)}`}
                className="px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-primary-600 stroke-[3]" />
                <span>Plan New Trip</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <Plane className="w-4 h-4 text-teal-300" />
                <span>Trips in Month</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {monthStats.tripsInMonth}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <CalendarDays className="w-4 h-4 text-indigo-300" />
                <span>Days Traveling</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {monthStats.travelDays}{" "}
                <span className="text-xs text-white/70 font-normal">days</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>Destinations</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">
                {monthStats.destinationsCount}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
              <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                <Clock className="w-4 h-4 text-rose-300" />
                <span>Next Departure</span>
              </div>
              <p className="text-lg font-bold text-white mt-1 truncate">
                {monthStats.nextTripDays !== null
                  ? monthStats.nextTripDays === 0
                    ? "Leaves Today!"
                    : `In ${monthStats.nextTripDays} days`
                  : "None scheduled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Control & Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Switcher */}
        <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <CalendarDays className="w-4 h-4 text-primary-600" />
            <span>Month Grid</span>
          </button>
          <button
            onClick={() => setViewMode("agenda")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === "agenda"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Timeline Agenda</span>
          </button>
          <button
            onClick={() => setViewMode("year")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              viewMode === "year"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Year Horizon</span>
          </button>
        </div>

        {/* Center/Right: Search and Status Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trip or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200/60">
            {["ALL", "CONFIRMED", "PLANNING", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  statusFilter === st
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📅 VIEW 1: ADVANCED MONTH GRID VIEW WITH MULTI-DAY SPAN RIBBONS */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Calendar Board */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
            {/* Header: Month Navigator */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/60 via-white to-gray-50/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 font-bold shadow-sm">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-display">
                    {month.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">
                    {monthStats.tripsInMonth} trip{monthStats.tripsInMonth === 1 ? "" : "s"} • {monthStats.travelDays} active travel days
                  </p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
                  }
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-all active:scale-95 shadow-sm"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setMonth(startOfMonth(now));
                    setSelectedDay(now);
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-all active:scale-95 shadow-sm"
                >
                  Today
                </button>
                <button
                  onClick={() =>
                    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
                  }
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-primary-700 hover:bg-primary-50 hover:border-primary-200 transition-all active:scale-95 shadow-sm"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/70">
              {WEEKDAYS.map((w, idx) => (
                <div
                  key={w}
                  className={cn(
                    "text-center text-xs font-bold py-3 uppercase tracking-wider",
                    idx === 0 || idx === 6 ? "text-primary-600" : "text-gray-500"
                  )}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Week-by-Week Spanning Rows */}
            <div className="divide-y divide-gray-100">
              {weeks.map((weekDays, wIdx) => {
                const weekStartMs = new Date(weekDays[0]).setHours(0, 0, 0, 0);
                const weekEndMs = new Date(weekDays[6]).setHours(23, 59, 59, 999);

                // Find trips intersecting this week
                const weekTrips = filteredTrips.filter((t) => {
                  const s = new Date(t.startDate).getTime();
                  const e = new Date(t.endDate).getTime();
                  return s <= weekEndMs && e >= weekStartMs;
                });

                return (
                  <div key={wIdx} className="relative">
                    {/* Background Day Cells Grid */}
                    <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[7.8rem]">
                      {weekDays.map((day, dIdx) => {
                        const inMonth = day.getMonth() === month.getMonth();
                        const isCurrentDay = sameDay(day, today);
                        const isSelected = sameDay(day, selectedDay);
                        const isWeekend = dIdx === 0 || dIdx === 6;

                        return (
                          <div
                            key={dIdx}
                            onClick={() => {
                              setSelectedDay(day);
                              const dayTrips = getTripsOnDay(day);
                              if (dayTrips.length > 0) {
                                setActiveTripModal(dayTrips[0]);
                              }
                            }}
                            className={cn(
                              "p-2 bg-white transition-all cursor-pointer relative group flex flex-col justify-between select-none",
                              !inMonth && "bg-gray-50/50 opacity-40 hover:opacity-75",
                              isWeekend && inMonth && "bg-gray-50/20",
                              isSelected && "bg-primary-50/30 ring-2 ring-primary-500 ring-inset z-10",
                              isCurrentDay && !isSelected && "bg-teal-50/40"
                            )}
                          >
                            {/* Date Number Header */}
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={cn(
                                  "inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-bold transition-all",
                                  isCurrentDay
                                    ? "bg-gradient-to-br from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-900/25 ring-2 ring-primary-200"
                                    : isSelected
                                    ? "bg-gray-900 text-white font-black"
                                    : inMonth
                                    ? "text-gray-800 group-hover:text-primary-600"
                                    : "text-gray-400"
                                )}
                              >
                                {day.getDate()}
                              </span>

                              {/* Hover "+" button to plan a trip */}
                              <Link
                                href={`/trips/new?startDate=${formatIsoDate(day)}`}
                                onClick={(e) => e.stopPropagation()}
                                title={`Plan trip starting ${day.toLocaleDateString()}`}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-gray-100 hover:bg-primary-100 text-primary-600 hover:text-primary-800"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </Link>
                            </div>

                            {/* Spacing for horizontal ribbon bars */}
                            <div className="h-14" />
                          </div>
                        );
                      })}
                    </div>

                    {/* Continuous Multi-Day Spanning Ribbon Bars Overlay */}
                    <div className="absolute top-9 left-0 right-0 pointer-events-none px-1 space-y-1.5 z-20">
                      {weekTrips.slice(0, 2).map((t) => {
                        const tripStart = new Date(t.startDate);
                        tripStart.setHours(0, 0, 0, 0);
                        const tripEnd = new Date(t.endDate);
                        tripEnd.setHours(23, 59, 59, 999);

                        // Compute column span in this week (0 to 6)
                        let startCol = 0;
                        let endCol = 6;

                        weekDays.forEach((day, i) => {
                          const dMs = day.getTime();
                          if (sameDay(day, tripStart)) startCol = i;
                          if (sameDay(day, tripEnd)) endCol = i;
                        });

                        if (tripStart.getTime() > weekStartMs) {
                          startCol = weekDays.findIndex((d) => sameDay(d, tripStart));
                          if (startCol === -1) startCol = 0;
                        }
                        if (tripEnd.getTime() < weekEndMs) {
                          endCol = weekDays.findIndex((d) => sameDay(d, tripEnd));
                          if (endCol === -1) endCol = 6;
                        }

                        const colSpan = endCol - startCol + 1;
                        const leftPercent = (startCol / 7) * 100;
                        const widthPercent = (colSpan / 7) * 100;

                        const isStartOfWeek = startCol === 0 && tripStart.getTime() < weekStartMs;
                        const isEndOfWeek = endCol === 6 && tripEnd.getTime() > weekEndMs;
                        const theme = tripThemeMap.get(t.id) || TRIP_THEMES[0];

                        return (
                          <div
                            key={t.id}
                            style={{
                              marginLeft: `${leftPercent}%`,
                              width: `calc(${widthPercent}% - 4px)`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTripModal(t);
                            }}
                            className={cn(
                              "pointer-events-auto cursor-pointer h-6 px-2 text-[11px] font-bold flex items-center justify-between transition-all hover:brightness-110 active:scale-[0.99] shadow-xs group truncate",
                              theme.bar,
                              isStartOfWeek ? "rounded-l-none" : "rounded-l-lg",
                              isEndOfWeek ? "rounded-r-none" : "rounded-r-lg"
                            )}
                            title={`${t.title} (${formatDateRange(t.startDate, t.endDate)})`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {!isStartOfWeek ? (
                                <Plane className="w-3 h-3 text-white/90 shrink-0 -rotate-45" />
                              ) : (
                                <span className="text-[10px] text-white/80 shrink-0">◀</span>
                              )}
                              <span className="truncate">{t.title}</span>
                            </div>

                            {/* City avatar chip / end indicator */}
                            <div className="flex items-center gap-1 shrink-0">
                              {t.stops?.[0]?.city?.name && (
                                <span className="hidden sm:inline-block text-[9px] bg-black/20 text-white px-1.5 py-0.5 rounded backdrop-blur-xs font-semibold">
                                  {t.stops[0].city.name}
                                </span>
                              )}
                              {isEndOfWeek && (
                                <span className="text-[10px] text-white/80">▶</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* +More Trips in this week indicator */}
                      {weekTrips.length > 2 && (
                        <div className="text-[10px] font-bold text-gray-500 px-2 pt-0.5 pointer-events-auto">
                          +{weekTrips.length - 2} more trips scheduled this week
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔍 Right Column: Selected Day & Trip Inspector */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 space-y-5 sticky top-6">
              {/* Day Header */}
              <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {sameDay(selectedDay, today) ? "Today's Agenda" : "Selected Date"}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {selectedDay.toLocaleDateString("en-US", { year: "numeric" })}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 font-display mt-2">
                  {selectedDay.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
              </div>

              {/* Day Schedule List */}
              {selectedDayTrips.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {selectedDayTrips.length} Active Trip{selectedDayTrips.length === 1 ? "" : "s"} on this Date:
                  </p>

                  {selectedDayTrips.map((t) => {
                    const theme = tripThemeMap.get(t.id) || TRIP_THEMES[0];
                    const duration = tripDurationDays(t.startDate, t.endDate);

                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "rounded-2xl border p-4 space-y-3 transition-all hover:shadow-md cursor-pointer",
                          activeTripModal?.id === t.id
                            ? "border-primary-300 bg-primary-50/30 ring-1 ring-primary-300"
                            : "border-gray-100 bg-gray-50/60 hover:bg-white"
                        )}
                        onClick={() => setActiveTripModal(t)}
                      >
                        {/* Trip Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm hover:text-primary-700 transition-colors">
                              {t.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {formatDateRange(t.startDate, t.endDate)} • {duration}d
                            </p>
                          </div>
                          <Badge
                            tone={
                              t.status === "CONFIRMED"
                                ? "green"
                                : t.status === "PLANNING"
                                ? "blue"
                                : t.status === "COMPLETED"
                                ? "indigo"
                                : "gray"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>

                        {/* Stops & Destinations */}
                        {t.stops && t.stops.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                              Destinations:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {t.stops.map((stop: any) => (
                                <span
                                  key={stop.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200/80 text-xs font-medium text-gray-700 shadow-xs"
                                >
                                  <MapPin className="w-3 h-3 text-primary-600" />
                                  <span>{stop.city?.name || "City"}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Budget & Open Action */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-xs text-gray-600 font-medium flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {t.budget > 0
                                ? formatMoney(t.budget, t.currency || "USD")
                                : "No budget set"}
                            </span>
                          </div>

                          <Link
                            href={`/trips/${t.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors"
                          >
                            <span>Open Trip</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                    <SunMedium className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      Free Travel Day!
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      No journeys scheduled on this date. Perfect time to plan a weekend getaway or start a new adventure!
                    </p>
                  </div>
                  <Link
                    href={`/trips/new?startDate=${formatIsoDate(selectedDay)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Plan Trip on this Date</span>
                  </Link>
                </div>
              )}

              {/* Quick Travel Tip */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 to-teal-50/50 border border-indigo-100/60 p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-900 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Continuous Multi-Day Span</span>
                </div>
                <p className="text-xs text-indigo-900/80 leading-relaxed">
                  Trips automatically draw unbroken journey ribbons across calendar weeks from your departure to your return date.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🧭 VIEW 2: TIMELINE / AGENDA VIEW */}
      {viewMode === "agenda" && (
        <div className="space-y-6">
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-12 text-center">
              <EmptyState
                icon={CalendarDays}
                title="No trips found"
                description={
                  searchQuery
                    ? "Try adjusting your search filters to find trips."
                    : "You don't have any scheduled trips yet. Create your first trip!"
                }
                action={{
                  label: "Plan a Trip",
                  onClick: () => (window.location.href = "/trips/new"),
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrips
                .sort(
                  (a, b) =>
                    new Date(a.startDate).getTime() -
                    new Date(b.startDate).getTime()
                )
                .map((t, idx) => {
                  const theme = tripThemeMap.get(t.id) || TRIP_THEMES[0];
                  const duration = tripDurationDays(t.startDate, t.endDate);
                  const isUpcoming =
                    new Date(t.startDate).getTime() >=
                    new Date().setHours(0, 0, 0, 0);

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-lift p-6 transition-all group relative overflow-hidden"
                    >
                      {/* Left color bar */}
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-2.5",
                          theme.badge
                        )}
                      />

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-3">
                        {/* Left: Trip overview */}
                        <div className="space-y-2.5 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold border",
                                theme.pill
                              )}
                            >
                              {duration} Days Trip
                            </span>
                            <Badge
                              tone={
                                t.status === "CONFIRMED"
                                  ? "green"
                                  : t.status === "PLANNING"
                                  ? "blue"
                                  : t.status === "COMPLETED"
                                  ? "indigo"
                                  : "gray"
                              }
                            >
                              {t.status}
                            </Badge>
                            {isUpcoming && (
                              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                                Upcoming
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors font-display">
                            <Link href={`/trips/${t.id}`}>{t.title}</Link>
                          </h3>

                          {t.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {t.description}
                            </p>
                          )}

                          {/* Destinations path */}
                          {t.stops && t.stops.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                                <Compass className="w-3.5 h-3.5 text-primary-600" /> Route:
                              </span>
                              {t.stops.map((stop: any, sIdx: number) => (
                                <div
                                  key={stop.id}
                                  className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200/60 shadow-2xs"
                                >
                                  <MapPin className="w-3 h-3 text-primary-600" />
                                  <span>{stop.city?.name || "Destination"}</span>
                                  {sIdx < t.stops.length - 1 && (
                                    <ArrowRight className="w-3 h-3 text-gray-400 ml-1" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Date details & Action button */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-5 lg:text-right">
                          <div className="space-y-1">
                            <div className="text-xs font-bold text-gray-900 flex items-center lg:justify-end gap-1.5">
                              <Calendar className="w-4 h-4 text-primary-600" />
                              <span>{formatDateRange(t.startDate, t.endDate)}</span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center lg:justify-end gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                {t.budget > 0
                                  ? formatMoney(t.budget, t.currency || "USD")
                                  : "Budget not set"}
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/trips/${t.id}`}
                            className="px-5 py-2.5 rounded-2xl bg-gray-900 hover:bg-primary-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                          >
                            <span>Explore Itinerary</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* 🌐 VIEW 3: YEAR HORIZON HEATMAP */}
      {viewMode === "year" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">
                  Year Horizon • {month.getFullYear()}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Bird's eye view of all 12 months. Click any month to zoom into its detailed calendar.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setMonth(new Date(month.getFullYear() - 1, month.getMonth(), 1))
                  }
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-gray-900 px-2">
                  {month.getFullYear()}
                </span>
                <button
                  onClick={() =>
                    setMonth(new Date(month.getFullYear() + 1, month.getMonth(), 1))
                  }
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 12 Months Mini Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }, (_, mIdx) => {
                const targetMonth = new Date(month.getFullYear(), mIdx, 1);
                const firstDay = targetMonth.getDay();
                const totalDaysInMonth = new Date(
                  month.getFullYear(),
                  mIdx + 1,
                  0
                ).getDate();

                const isCurrentMonth =
                  targetMonth.getMonth() === new Date().getMonth() &&
                  targetMonth.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={mIdx}
                    onClick={() => {
                      setMonth(targetMonth);
                      setViewMode("grid");
                    }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:border-primary-300",
                      isCurrentMonth
                        ? "bg-primary-50/40 border-primary-200 ring-1 ring-primary-300"
                        : "bg-gray-50/50 border-gray-100 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-gray-900">
                        {MONTH_NAMES[mIdx]}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    {/* Mini Weekdays */}
                    <div className="grid grid-cols-7 gap-1 text-[9px] text-gray-400 text-center font-bold mb-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
                        <span key={i}>{w}</span>
                      ))}
                    </div>

                    {/* Mini Month Grid */}
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
                      {/* Blank spaces before first day */}
                      {Array.from({ length: firstDay }, (_, i) => (
                        <span key={`blank-${i}`} className="w-5 h-5" />
                      ))}

                      {/* Days */}
                      {Array.from({ length: totalDaysInMonth }, (_, dIdx) => {
                        const d = new Date(
                          month.getFullYear(),
                          mIdx,
                          dIdx + 1
                        );
                        const hasTrip = getTripsOnDay(d, trips).length > 0;
                        const isToday = sameDay(d, today);

                        return (
                          <span
                            key={dIdx}
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center font-medium transition-colors mx-auto",
                              hasTrip
                                ? "bg-emerald-500 text-white font-bold shadow-xs"
                                : isToday
                                ? "bg-primary-600 text-white"
                                : "text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {dIdx + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Interactive Trip Details Modal */}
      <AnimatePresence>
        {activeTripModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 relative"
            >
              {/* Modal Cover Header */}
              <div className="relative h-44 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 text-white p-6 flex flex-col justify-between">
                {activeTripModal.coverImage && (
                  <img
                    src={activeTripModal.coverImage}
                    alt={activeTripModal.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Top Row: Close button */}
                <div className="relative z-10 flex items-center justify-between">
                  <Badge
                    tone={
                      activeTripModal.status === "CONFIRMED"
                        ? "green"
                        : activeTripModal.status === "PLANNING"
                        ? "blue"
                        : activeTripModal.status === "COMPLETED"
                        ? "indigo"
                        : "gray"
                    }
                  >
                    {activeTripModal.status}
                  </Badge>

                  <button
                    onClick={() => setActiveTripModal(null)}
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Row: Title */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white font-display leading-tight">
                    {activeTripModal.title}
                  </h3>
                  <p className="text-white/80 text-xs mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-300" />
                    <span>
                      {formatDateRange(
                        activeTripModal.startDate,
                        activeTripModal.endDate
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      {tripDurationDays(
                        activeTripModal.startDate,
                        activeTripModal.endDate
                      )}{" "}
                      Days
                    </span>
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {activeTripModal.description && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {activeTripModal.description}
                  </p>
                )}

                {/* Destinations List */}
                {activeTripModal.stops && activeTripModal.stops.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Itinerary Stops & Cities
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeTripModal.stops.map((stop: any) => (
                        <div
                          key={stop.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50 border border-gray-200/60"
                        >
                          {stop.city?.imageUrl ? (
                            <img
                              src={stop.city.imageUrl}
                              alt={stop.city.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-xs text-gray-900 truncate">
                              {stop.city?.name || "City Stop"}
                            </h5>
                            <p className="text-[10px] text-gray-500 truncate">
                              {stop.city?.country || "Destination"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget summary */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">
                    Allocated Budget:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {activeTripModal.budget > 0
                      ? formatMoney(
                          activeTripModal.budget,
                          activeTripModal.currency || "USD"
                        )
                      : "No budget specified"}
                  </span>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href={`/trips/${activeTripModal.id}`}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white text-xs font-bold text-center transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Open Full Itinerary</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setActiveTripModal(null)}
                    className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
