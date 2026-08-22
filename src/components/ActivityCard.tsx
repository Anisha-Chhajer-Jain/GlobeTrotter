"use client";

import { Star, Clock, Plus, Check, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Misc";
import { formatMoney } from "@/lib/format";
import { formatDuration } from "@/lib/budget";

const TYPE_TONE: Record<string, "gray" | "blue" | "green" | "amber" | "red" | "indigo"> = {
  SIGHTSEEING: "blue",
  FOOD: "amber",
  TRANSPORT: "gray",
  ACCOMMODATION: "indigo",
  ENTERTAINMENT: "red",
  SHOPPING: "amber",
  ADVENTURE: "green",
  CULTURE: "indigo",
  NATURE: "green",
  OTHER: "gray",
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
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="h-28 bg-gradient-to-br from-amber-50 to-orange-100 relative">
        {activity.imageUrl && <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />}
        <div className="absolute top-2 left-2">
          <Badge tone={TYPE_TONE[activity.type] ?? "gray"}>{activity.type}</Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-gray-900 line-clamp-1">{activity.name}</h4>
        {activity.city?.name && (
          <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="w-3 h-3" /> {activity.city.name}, {activity.city.country}
          </p>
        )}
        {activity.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{activity.description}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {activity.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {Number(activity.rating).toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {formatDuration(activity.duration)}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {Number(activity.cost) === 0 ? "Free" : formatMoney(activity.cost, activity.currency)}
          </span>
          {onAdd && (
            <Button size="sm" variant={added ? "secondary" : "outline"} onClick={() => onAdd(activity)} loading={adding} disabled={added}>
              {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {added ? "Added" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
