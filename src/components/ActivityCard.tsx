"use client";

import { Star, Clock, Plus, Check, MapPin, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Misc";
import { formatMoney } from "@/lib/format";
import { formatDuration } from "@/lib/budget";

const TYPE_TONE: Record<string, "gray" | "blue" | "green" | "amber" | "red" | "indigo" | "coral"> = {
  SIGHTSEEING:   "blue",
  FOOD:          "amber",
  TRANSPORT:     "gray",
  ACCOMMODATION: "indigo",
  ENTERTAINMENT: "coral",
  SHOPPING:      "amber",
  ADVENTURE:     "green",
  CULTURE:       "indigo",
  NATURE:        "green",
  OTHER:         "gray",
};

const TYPE_GRADIENT: Record<string, string> = {
  SIGHTSEEING:   "from-sky-400 to-blue-500",
  FOOD:          "from-amber-400 to-orange-500",
  TRANSPORT:     "from-slate-400 to-gray-500",
  ACCOMMODATION: "from-indigo-400 to-violet-500",
  ENTERTAINMENT: "from-red-400 to-rose-500",
  SHOPPING:      "from-pink-400 to-fuchsia-500",
  ADVENTURE:     "from-emerald-400 to-green-600",
  CULTURE:       "from-purple-400 to-indigo-500",
  NATURE:        "from-teal-400 to-emerald-500",
  OTHER:         "from-slate-300 to-slate-400",
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
  const gradient = TYPE_GRADIENT[activity.type] || "from-blue-400 to-indigo-500";
  const cost = Number(activity.cost ?? 0);
  const currency = activity.currency || "INR";

  return (
    <div className="card-premium overflow-hidden flex flex-col group">
      {/* Image / Gradient */}
      <div className="relative overflow-hidden" style={{ height: 120 }}>
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt={activity.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Zap className="w-8 h-8 text-white/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-2 left-2">
          <Badge tone={TYPE_TONE[activity.type] ?? "gray"}>{activity.type}</Badge>
        </div>
        {/* Rating overlay */}
        {activity.rating != null && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {Number(activity.rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 leading-snug">{activity.name}</h4>
        {activity.city?.name && (
          <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <MapPin className="w-3 h-3" /> {activity.city.name}, {activity.city.country}
          </p>
        )}
        {activity.description && (
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{activity.description}</p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {formatDuration(activity.duration)}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="price-badge text-sm">
            {cost === 0 ? (
              <span className="text-emerald-600 font-bold">Free</span>
            ) : (
              formatMoney(cost, currency)
            )}
          </span>
          {onAdd && (
            <Button
              size="xs"
              variant={added ? "secondary" : "coral"}
              onClick={() => onAdd(activity)}
              loading={adding}
              disabled={added}
            >
              {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {added ? "Added" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
