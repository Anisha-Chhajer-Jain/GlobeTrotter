"use client";

import Link from "next/link";
import { Calendar, MapPin, MoreVertical, Pencil, Trash2, Copy, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Misc";
import { formatDateRange } from "@/lib/format";
import { formatMoney } from "@/lib/format";

const STATUS_TONE: Record<string, "gray" | "blue" | "green" | "amber" | "red" | "indigo"> = {
  DRAFT: "gray",
  PLANNING: "blue",
  CONFIRMED: "green",
  COMPLETED: "indigo",
  CANCELLED: "red",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const COVER_GRADIENTS = [
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-teal-400 via-cyan-500 to-blue-600",
  "from-orange-400 via-red-400 to-pink-500",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-violet-500 via-purple-500 to-indigo-600",
];

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const cities = trip.stops?.map((s: any) => s.city?.name).filter(Boolean) ?? [];
  const cover = trip.coverImage || trip.stops?.[0]?.city?.imageUrl;
  const gradientClass = COVER_GRADIENTS[trip.title?.charCodeAt(0) % COVER_GRADIENTS.length] || COVER_GRADIENTS[0];
  const budget = Number(trip.budget || 0);
  const currency = trip.currency || "INR";

  return (
    <div className="card-premium overflow-hidden flex flex-col group animate-fade-up">
      {/* Cover */}
      <Link href={`/trips/${trip.id}`} className="block relative overflow-hidden" style={{ height: 140 }}>
        {cover ? (
          <img
            src={cover}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-end p-3`}>
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest">
              {cities[0] || "Adventure"}
            </p>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge tone={STATUS_TONE[trip.status] ?? "gray"}>{STATUS_LABEL[trip.status] ?? trip.status}</Badge>
        </div>
        {/* Stop count pill */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
          {trip._count?.stops ?? trip.stops?.length ?? 0} stops
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/trips/${trip.id}`} className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {trip.title}
            </h3>
          </Link>
          {(onDelete || onCopy) && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Trip options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 animate-fade-in">
                  <Link
                    href={`/trips/${trip.id}/build`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit itinerary
                  </Link>
                  {onCopy && (
                    <button
                      onClick={() => { setMenuOpen(false); onCopy(trip); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate trip
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { setMenuOpen(false); onDelete(trip); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete trip
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
          {cities.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{cities.slice(0, 3).join(" → ")}{cities.length > 3 ? " …" : ""}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Budget</span>
          <span className="price-badge text-sm">
            {budget === 0 ? "Not set" : formatMoney(budget, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
