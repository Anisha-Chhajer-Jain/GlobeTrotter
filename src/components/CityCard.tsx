"use client";

import { MapPin, TrendingUp, Plus, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Misc";

export default function CityCard({
  city,
  onAdd,
  added,
  adding,
}: {
  city: any;
  onAdd?: (city: any) => void;
  added?: boolean;
  adding?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="h-28 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
        {city.imageUrl && <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />}
        <div className="absolute top-2 right-2">
          <Badge tone="blue">
            <TrendingUp className="w-3 h-3 mr-1 inline" />
            {city.popularity}
          </Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-gray-900">{city.name}</h4>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <MapPin className="w-3 h-3" /> {city.country}
        </p>
        {city.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{city.description}</p>}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Cost index <span className="font-semibold text-gray-700">{city.costIndex}</span>
          </span>
          {onAdd && (
            <Button size="sm" variant={added ? "secondary" : "outline"} onClick={() => onAdd(city)} loading={adding} disabled={added}>
              {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {added ? "Added" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
