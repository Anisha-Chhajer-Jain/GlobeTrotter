"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Clock,
  ArrowRight,
  Plane,
  Compass,
  Wallet,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Misc";
import { formatDateRange, formatMoney, tripDurationDays } from "@/lib/format";
import { cn } from "@/lib/cn";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-gray-900/60 backdrop-blur-md border-white/20",
    text: "text-gray-200",
    dot: "bg-gray-400",
  },
  PLANNING: {
    label: "Planning",
    bg: "bg-blue-900/60 backdrop-blur-md border-blue-400/30",
    text: "text-blue-200",
    dot: "bg-blue-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-emerald-900/60 backdrop-blur-md border-emerald-400/30",
    text: "text-emerald-200",
    dot: "bg-emerald-400",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-indigo-900/60 backdrop-blur-md border-indigo-400/30",
    text: "text-indigo-200",
    dot: "bg-indigo-400",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-900/60 backdrop-blur-md border-red-400/30",
    text: "text-red-200",
    dot: "bg-red-400",
  },
};

function getCountdownLabel(trip: any): string | null {
  if (trip.status === "COMPLETED" || trip.status === "CANCELLED") return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = trip.startDate ? new Date(trip.startDate) : null;
  const end = trip.endDate ? new Date(trip.endDate) : null;
  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(0, 0, 0, 0);

  if (end && end < now) return null;
  const dayMs = 24 * 60 * 60 * 1000;

  if (start && start > now) {
    const days = Math.round((start.getTime() - now.getTime()) / dayMs);
    if (days === 0) return "Leaves Today!";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  }
  if (start && start <= now && (!end || end >= now)) {
    if (end) {
      const days = Math.round((end.getTime() - now.getTime()) / dayMs);
      if (days <= 0) return "Last day!";
      return `${days} day${days === 1 ? "" : "s"} left`;
    }
    return "Ongoing";
  }
  return null;
}

export default function TripCard({
  trip,
  onDelete,
  onCopy,
}: {
  trip: any;
  onDelete?: (trip: any) => void;
  onCopy?: (trip: any) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const cities = trip.stops?.map((s: any) => s.city?.name).filter(Boolean) ?? [];
  const cover = trip.coverImage || trip.stops?.[0]?.city?.imageUrl;
  const countdown = getCountdownLabel(trip);
  const statusCfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.DRAFT;
  const stopCount = trip._count?.stops ?? trip.stops?.length ?? 0;
  const duration = tripDurationDays(trip.startDate, trip.endDate);

  return (
    <motion.div
      className="group bg-white rounded-3xl border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-primary-200 transition-all duration-300 overflow-hidden flex flex-col relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top Cover Image Area */}
      <Link href={`/trips/${trip.id}`} className="block relative overflow-hidden">
        <div className="h-44 bg-gradient-to-br from-teal-900 via-primary-950 to-indigo-950 relative overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={trip.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-teal-300/40 p-4">
              <Compass className="w-12 h-12 stroke-[1.2] mb-1" />
              <span className="text-[11px] font-semibold text-teal-200/60 uppercase tracking-wider">
                GlobeTrotter Journey
              </span>
            </div>
          )}

          {/* Dark gradient mask for top badges readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/40" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
            {/* Status pill */}
            <div
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm",
                statusCfg.bg,
                statusCfg.text
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusCfg.dot)} />
              <span>{statusCfg.label}</span>
            </div>

            {/* Countdown badge */}
            {countdown && (
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/90 text-amber-950 backdrop-blur-md shadow-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{countdown}</span>
              </div>
            )}
          </div>

          {/* Bottom on-image destination preview */}
          {cities.length > 0 && (
            <div className="absolute bottom-3 left-3.5 right-3.5 pointer-events-none">
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/95 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 truncate max-w-full">
                <MapPin className="w-3 h-3 text-teal-300 shrink-0" />
                <span className="truncate">{cities.join(" → ")}</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title & Options Menu */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/trips/${trip.id}`} className="min-w-0 group-hover:text-primary-600 transition-colors">
              <h3 className="text-base font-extrabold text-gray-900 truncate font-display">
                {trip.title}
              </h3>
            </Link>

            {(onDelete || onCopy) && (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Trip Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5">
                    <Link
                      href={`/trips/${trip.id}/build`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="w-3.5 h-3.5 text-gray-400" /> Edit Itinerary
                    </Link>
                    {onCopy && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onCopy(trip);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-400" /> Duplicate
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(trip);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete Trip
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Range & Duration */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span className="truncate">
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            {duration > 0 && (
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                {duration}d
              </span>
            )}
          </div>
        </div>

        {/* Bottom Bar: Stops, Budget & Smooth Interactive Arrow */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
            <Compass className="w-3.5 h-3.5 text-gray-400" />
            <span>
              {stopCount} {stopCount === 1 ? "stop" : "stops"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-200/60 transition-colors group-hover:border-primary-200 group-hover:bg-primary-50/40">
              {trip.budget > 0
                ? formatMoney(trip.budget, trip.currency || "USD")
                : "No budget"}
            </span>

            <div className="w-7 h-7 rounded-xl bg-gray-50 group-hover:bg-primary-600 text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
