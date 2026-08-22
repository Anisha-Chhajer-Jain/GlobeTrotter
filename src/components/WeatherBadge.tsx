"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from "lucide-react";
import { fetchCurrentWeather, describeWeatherCode } from "@/lib/weather";

const ICONS = {
  sun: Sun,
  cloud: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
  fog: CloudFog,
};

export default function WeatherBadge({
  latitude,
  longitude,
  className = "",
}: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  className?: string;
}) {
  const [weather, setWeather] = useState<{ temperatureC: number; code: number } | null>(null);
  const lat = latitude != null ? Number(latitude) : null;
  const lon = longitude != null ? Number(longitude) : null;

  useEffect(() => {
    if (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon)) return;
    let cancelled = false;
    fetchCurrentWeather(lat, lon).then((w) => {
      if (!cancelled) setWeather(w);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (lat == null || lon == null || !weather) return null;

  const { label, icon } = describeWeatherCode(weather.code);
  const Icon = ICONS[icon];

  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {Math.round(weather.temperatureC)}°C
    </span>
  );
}
