"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, TrendingUp, Plus, Check, Compass, Sparkles, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import WeatherBadge from "@/components/WeatherBadge";
import { cn } from "@/lib/cn";

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-primary-200 transition-all duration-300 overflow-hidden flex flex-col group relative"
    >
      {/* City Photo Header */}
      <div className="h-36 bg-gradient-to-br from-teal-900 via-primary-950 to-indigo-950 relative overflow-hidden">
        {city.imageUrl ? (
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-teal-300/40 p-4">
            <Compass className="w-10 h-10 stroke-[1.2] mb-1" />
            <span className="text-[10px] font-bold text-teal-200/60 uppercase tracking-wider">
              {city.name}
            </span>
          </div>
        )}

        {/* Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Popularity Badge */}
          <div className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-400 text-teal-950 shadow-sm backdrop-blur-md flex items-center gap-1">
            <TrendingUp className="w-3 h-3 stroke-[2.5]" />
            <span>{city.popularity} Score</span>
          </div>

          {/* Weather Badge */}
          <WeatherBadge
            latitude={city.latitude}
            longitude={city.longitude}
            className="bg-black/40 text-white backdrop-blur-md border border-white/20 shadow-sm"
          />
        </div>

        {/* Bottom City Name on image */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5">
          <h4 className="text-lg font-extrabold text-white font-display truncate drop-shadow-md">
            {city.name}
          </h4>
          <p className="text-[11px] font-medium text-white/80 flex items-center gap-1 truncate drop-shadow-sm">
            <MapPin className="w-3 h-3 text-teal-300 shrink-0" />
            <span>{city.country}</span>
          </p>
        </div>
      </div>

      {/* City Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {city.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {city.description}
          </p>
        )}

        {/* Footer: Cost Index & Action */}
        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <span className="text-[11px] text-gray-400">Cost:</span>
            <span className="font-bold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200/60">
              {city.costIndex}
            </span>
          </div>

          {onAdd ? (
            <Button
              size="sm"
              variant={added ? "secondary" : "outline"}
              onClick={() => onAdd(city)}
              loading={adding}
              disabled={added}
              className="rounded-xl px-3 py-1 text-xs"
            >
              {added ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5 text-primary-600" />}
              <span>{added ? "Added" : "Add to Trip"}</span>
            </Button>
          ) : (
            <Link
              href={`/trips/new?city=${encodeURIComponent(city.name)}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors group-hover:translate-x-0.5"
            >
              <span>Plan Trip</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
