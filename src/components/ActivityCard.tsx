"use client";

import { useState } from "react";
import { Star, Clock, Plus, Check, MapPin, Compass, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import { formatDuration } from "@/lib/budget";

const TYPE_EMOJIS: Record<string, string> = {
  SIGHTSEEING: "🗽 Sightseeing",
  FOOD: "🍜 Dining & Food",
  TRANSPORT: "🚆 Transit",
  ACCOMMODATION: "🏨 Stay",
  ENTERTAINMENT: "🎭 Entertainment",
  SHOPPING: "🛍️ Shopping",
  ADVENTURE: "⛰️ Adventure",
  CULTURE: "🏛️ Culture & Arts",
  NATURE: "🌿 Nature & Parks",
  OTHER: "✨ Activity",
};

const TYPE_COLORS: Record<string, string> = {
  SIGHTSEEING: "bg-teal-500/90 text-white border-teal-400/40",
  FOOD: "bg-amber-500/90 text-white border-amber-400/40",
  TRANSPORT: "bg-blue-500/90 text-white border-blue-400/40",
  ACCOMMODATION: "bg-indigo-500/90 text-white border-indigo-400/40",
  ENTERTAINMENT: "bg-rose-500/90 text-white border-rose-400/40",
  SHOPPING: "bg-purple-500/90 text-white border-purple-400/40",
  ADVENTURE: "bg-emerald-500/90 text-white border-emerald-400/40",
  CULTURE: "bg-violet-500/90 text-white border-violet-400/40",
  NATURE: "bg-green-500/90 text-white border-green-400/40",
  OTHER: "bg-gray-700/90 text-white border-gray-600/40",
};

export default function ActivityCard({
  activity,
  onAdd,
  added,
  adding,
}: {
  activity: any;
  onAdd?: (activity: any) => void;
  added?: boolean;
  adding?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-teal-300 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Activity Image Banner */}
      <div className="h-36 bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 relative overflow-hidden shrink-0">
        {activity.imageUrl && !imgError ? (
          <img
            src={activity.imageUrl}
            alt={activity.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-teal-300/40 p-4">
            <Compass className="w-10 h-10 stroke-[1.2] mb-1" />
            <span className="text-[10px] font-bold text-teal-200/60 uppercase tracking-wider">
              {activity.type || "Experience"}
            </span>
          </div>
        )}

        {/* Ambient Overlay Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Top Type Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-xs ${
              TYPE_COLORS[activity.type] || "bg-gray-800/80 text-white border-white/20"
            }`}
          >
            {TYPE_EMOJIS[activity.type] || activity.type}
          </span>
        </div>

        {/* Bottom Location Bar on Image */}
        {activity.city?.name && (
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1 text-[11px] font-bold text-white drop-shadow-sm truncate">
            <MapPin className="w-3 h-3 text-teal-300 shrink-0" />
            <span className="truncate">{activity.city.name}, {activity.city.country}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">
            {activity.name}
          </h4>

          {activity.description && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {activity.description}
            </p>
          )}
        </div>

        {/* Meta Stats: Rating + Duration */}
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 pt-1">
          {activity.rating != null && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/80">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(activity.rating).toFixed(1)}</span>
            </span>
          )}
          {activity.duration && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200/60 text-gray-600">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{formatDuration(activity.duration)}</span>
            </span>
          )}
        </div>

        {/* Footer: Price + Add Button */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Estimated Cost</p>
            <p className="text-sm font-black text-gray-900">
              {Number(activity.cost) === 0 ? "Free" : formatMoney(activity.cost, activity.currency)}
            </p>
          </div>

          {onAdd && (
            <Button
              size="sm"
              variant={added ? "secondary" : "primary"}
              onClick={() => onAdd(activity)}
              loading={adding}
              disabled={added}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold shadow-sm transition-all ${
                added ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" : ""
              }`}
            >
              {added ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{added ? "Added" : "Add to Trip"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
