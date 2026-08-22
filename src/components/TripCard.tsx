"use client";

import Link from "next/link";
import { Calendar, MapPin, MoreVertical, Pencil, Trash2, Copy } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/Misc";
import { formatDateRange } from "@/lib/format";

const STATUS_TONE: Record<string, "gray" | "blue" | "green" | "amber" | "red" | "indigo"> = {
  DRAFT: "gray",
  PLANNING: "blue",
  CONFIRMED: "green",
  COMPLETED: "indigo",
  CANCELLED: "red",
};

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

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <Link href={`/trips/${trip.id}`} className="block">
        <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
          {cover && <img src={cover} alt={trip.title} className="w-full h-full object-cover" />}
          <div className="absolute top-3 left-3">
            <Badge tone={STATUS_TONE[trip.status] ?? "gray"}>{trip.status}</Badge>
          </div>
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/trips/${trip.id}`} className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate hover:text-blue-600">{trip.title}</h3>
          </Link>
          {(onDelete || onCopy) && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-10 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                  <Link
                    href={`/trips/${trip.id}/build`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Link>
                  {onCopy && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onCopy(trip);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(trip);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
        {cities.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{cities.join(" → ")}</span>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>{trip._count?.stops ?? trip.stops?.length ?? 0} stops</span>
          <span className="font-semibold text-gray-700">
            {trip.currency} {Number(trip.budget || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
