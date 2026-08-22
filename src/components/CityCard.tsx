"use client";

import { MapPin, TrendingUp, Plus, Check } from "lucide-react";
import Button from "@/components/ui/Button";

const CITY_GRADIENTS = [
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
];

/** Renders 5 small dots where the first `filled` are orange */
function CostDots({ index = 2 }: { index?: number }) {
  const n = Math.min(Math.max(index, 1), 5);
  return (
    <span className="flex items-center gap-0.5" title={`Cost level ${n} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full transition-colors"
          style={{ background: i < n ? "#F97316" : "#E2E8F0" }}
        />
      ))}
    </span>
  );
}

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
  const gradient = CITY_GRADIENTS[city.name?.charCodeAt(0) % CITY_GRADIENTS.length] || CITY_GRADIENTS[0];

  return (
    <div className="card-premium overflow-hidden flex flex-col group cursor-pointer">
      {/* Image area */}
      <div className="relative overflow-hidden" style={{ height: 140 }}>
        {city.imageUrl ? (
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        {/* Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Top-right popularity badge */}
        {city.popularity != null && (
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> {city.popularity}
            </span>
          </div>
        )}

        {/* Bottom-left country */}
        <div className="absolute bottom-2.5 left-3">
          <p className="text-white text-xs font-semibold flex items-center gap-1 drop-shadow">
            <MapPin className="w-3 h-3" /> {city.country}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="font-bold text-slate-900 text-sm leading-snug">{city.name}</h4>
        {city.description && (
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{city.description}</p>
        )}

        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Cost</span>
            <CostDots index={city.costIndex ?? 2} />
          </div>
          {onAdd && (
            <Button
              size="xs"
              variant={added ? "secondary" : "primary"}
              onClick={() => onAdd(city)}
              loading={adding}
              disabled={added}
            >
              {added ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {added ? "Added" : "Add stop"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
