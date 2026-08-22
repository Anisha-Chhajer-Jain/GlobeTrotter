"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  Layers,
  Sparkles,
  Plane,
  Clock,
  Calendar,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import WeatherBadge from "@/components/WeatherBadge";
import { formatDateRange, formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

// Fallback coordinate mappings for cities if latitude/longitude are null in DB
const CITY_COORDS_FALLBACK: Record<string, [number, number]> = {
  "new york city": [40.7128, -74.006],
  "new york": [40.7128, -74.006],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  tokyo: [35.6762, 139.6503],
  rome: [41.9028, 12.4964],
  barcelona: [41.3851, 2.1734],
  amsterdam: [52.3676, 4.9041],
  bali: [-8.4095, 115.1889],
  dubai: [25.2048, 55.2708],
  bangkok: [13.7563, 100.5018],
  singapore: [1.3521, 103.8198],
  sydney: [-33.8688, 151.2093],
  kyoto: [35.0116, 135.7681],
  florence: [43.7696, 11.2558],
  venice: [45.4408, 12.3155],
  cairo: [30.0444, 31.2357],
  berlin: [52.52, 13.405],
  vienna: [48.2082, 16.3738],
  prague: [50.0755, 14.4378],
  toronto: [43.6532, -79.3832],
  vancouver: [49.2827, -123.1207],
  "los angeles": [34.0522, -118.2437],
  "san francisco": [37.7749, -122.4194],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
};

function getCityCoordinates(city: any): [number, number] | null {
  if (city?.latitude != null && city?.longitude != null) {
    const lat = Number(city.latitude);
    const lon = Number(city.longitude);
    if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
  }
  const cityName = city?.name?.toLowerCase().trim();
  if (cityName && CITY_COORDS_FALLBACK[cityName]) {
    return CITY_COORDS_FALLBACK[cityName];
  }
  return null;
}

interface TripRouteMapProps {
  stops: any[];
  tripTitle?: string;
  className?: string;
  onSelectStop?: (stop: any) => void;
}

export default function TripRouteMap({
  stops = [],
  tripTitle = "Trip Route",
  className = "",
  onSelectStop,
}: TripRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"voyager" | "satellite" | "positron">("voyager");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter valid stops with coordinates
  const stopsWithCoords = stops
    .map((s) => ({
      ...s,
      coords: getCityCoordinates(s.city),
    }))
    .filter((s) => s.coords !== null) as (any & { coords: [number, number] })[];

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === "undefined") return;

    let isCancelled = false;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (isCancelled || !mapContainerRef.current) return;

      // Fix default Leaflet icon paths in Webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      // Destroy old instance if re-rendering
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center
      const defaultCenter: [number, number] =
        stopsWithCoords.length > 0 ? stopsWithCoords[0].coords : [20, 0];
      const defaultZoom = stopsWithCoords.length > 0 ? 5 : 2;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      // Tile layer selection
      const tileUrls = {
        voyager: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        positron: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      };

      L.tileLayer(tileUrls[mapStyle], {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Plot stops & connecting route line
      if (stopsWithCoords.length > 0) {
        const latlngs = stopsWithCoords.map((s) => s.coords);

        // 1. Draw glowing dashed polyline route path
        if (latlngs.length > 1) {
          // Glow background line
          L.polyline(latlngs, {
            color: "#0f766e",
            weight: 6,
            opacity: 0.35,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);

          // Foreground dashed line with animation style
          L.polyline(latlngs, {
            color: "#0d9488",
            weight: 3.5,
            opacity: 0.95,
            dashArray: "8, 12",
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);
        }

        // 2. Custom Numbered Pin Markers
        stopsWithCoords.forEach((stop, index) => {
          const isSelected = activeStopId === stop.id;
          const stopNumber = index + 1;
          const cityName = stop.city?.name || `Stop ${stopNumber}`;
          const countryName = stop.city?.country || "";
          const activityCount = stop.activities?.length || 0;
          const dates = formatDateRange(stop.arrivalDate, stop.departureDate);

          const customIcon = L.divIcon({
            className: "custom-leaflet-marker",
            html: `
              <div class="relative flex items-center justify-center cursor-pointer group">
                <div class="absolute -inset-1.5 rounded-full bg-teal-500/30 animate-ping opacity-75"></div>
                <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-600 via-primary-700 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xl shadow-teal-900/40 border-2 border-white transform transition-transform duration-200 hover:scale-115">
                  ${stopNumber}
                </div>
                <div class="absolute -bottom-1 w-2 h-2 bg-teal-700 rotate-45 border-r border-b border-white"></div>
                <div class="absolute -top-7 whitespace-nowrap px-2 py-0.5 rounded-lg bg-gray-900/90 backdrop-blur-md text-white text-[10px] font-bold shadow-md border border-white/10 pointer-events-none">
                  ${cityName}
                </div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
          });

          const marker = L.marker(stop.coords, { icon: customIcon }).addTo(map);

          // Rich Popup Card
          const popupHtml = `
            <div class="p-3 space-y-2 min-w-[210px] font-sans">
              <div class="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                <div>
                  <span class="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md">
                    Stop #${stopNumber}
                  </span>
                  <h4 class="font-extrabold text-sm text-gray-900 mt-1">${cityName}</h4>
                  <p class="text-[11px] text-gray-500 font-medium">${countryName}</p>
                </div>
              </div>
              <div class="text-[11px] text-gray-600 space-y-1 pt-1">
                <div class="flex items-center gap-1.5 text-gray-500">
                  <span>📅</span>
                  <span>${dates}</span>
                </div>
                <div class="flex items-center gap-1.5 text-gray-500">
                  <span>📍</span>
                  <span>${activityCount} planned activit${activityCount === 1 ? "y" : "ies"}</span>
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupHtml, {
            className: "luxury-leaflet-popup",
            closeButton: true,
          });

          marker.on("click", () => {
            setActiveStopId(stop.id);
            if (onSelectStop) onSelectStop(stop);
          });
        });

        // 3. Fit bounds to show all markers smoothly
        if (latlngs.length === 1) {
          map.setView(latlngs[0], 10);
        } else {
          const bounds = L.latLngBounds(latlngs);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
        }
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stopsWithCoords.length, mapStyle]);

  // Pan to stop on click
  function panToStop(stop: any) {
    setActiveStopId(stop.id);
    if (mapInstanceRef.current && stop.coords) {
      mapInstanceRef.current.flyTo(stop.coords, 11, {
        duration: 1.2,
      });
    }
    if (onSelectStop) onSelectStop(stop);
  }

  // Reset view to fit all stops
  function fitAllStops() {
    if (mapInstanceRef.current && stopsWithCoords.length > 0) {
      if (stopsWithCoords.length === 1) {
        mapInstanceRef.current.flyTo(stopsWithCoords[0].coords, 10);
      } else {
        const latlngs = stopsWithCoords.map((s) => s.coords);
        import("leaflet").then((L) => {
          const bounds = L.latLngBounds(latlngs);
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [60, 60],
            maxZoom: 12,
          });
        });
      }
    }
  }

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-100 shadow-soft transition-all duration-300",
        isFullscreen ? "fixed inset-4 z-50 rounded-3xl shadow-2xl" : "h-[460px] sm:h-[520px] w-full",
        className
      )}
    >
      {/* Map Leaflet Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-900" />

      {/* Top Left: Trip Route Header Overlay */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-200/80 shadow-md flex items-center gap-3 pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-primary-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-900 font-display">
              {tripTitle} Route Map
            </h3>
            <p className="text-[10px] text-gray-500 font-semibold">
              {stopsWithCoords.length} Destinations Plotted
            </p>
          </div>
        </div>
      </div>

      {/* Top Right: Map Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Layer style toggle */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-gray-200/80 shadow-md flex items-center gap-1">
          <button
            onClick={() => setMapStyle("voyager")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all",
              mapStyle === "voyager"
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "text-gray-600 hover:text-gray-900"
            )}
            title="Standard Street & Voyager Map"
          >
            Voyager
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all",
              mapStyle === "satellite"
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "text-gray-600 hover:text-gray-900"
            )}
            title="Satellite Imagery"
          >
            Satellite
          </button>
          <button
            onClick={() => setMapStyle("positron")}
            className={cn(
              "px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all",
              mapStyle === "positron"
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "text-gray-600 hover:text-gray-900"
            )}
            title="Minimal Positron"
          >
            Light
          </button>
        </div>

        {/* Reset Zoom & Fit All */}
        <button
          onClick={fitAllStops}
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/80 text-gray-700 hover:text-teal-700 hover:bg-teal-50 shadow-md transition-all active:scale-95"
          title="Fit all stops in view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200/80 text-gray-700 hover:text-teal-700 hover:bg-teal-50 shadow-md transition-all active:scale-95"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Horizontal Stop Ribbon Navigator */}
      {stopsWithCoords.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-auto">
            {stopsWithCoords.map((stop, index) => {
              const isSelected = activeStopId === stop.id;
              const stopNumber = index + 1;
              const cityName = stop.city?.name || `Stop ${stopNumber}`;

              return (
                <button
                  key={stop.id}
                  onClick={() => panToStop(stop)}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2 rounded-2xl backdrop-blur-md border transition-all duration-200 shrink-0 shadow-lg text-left group",
                    isSelected
                      ? "bg-gray-950/90 text-white border-teal-400 ring-2 ring-teal-400/40 scale-102"
                      : "bg-white/90 text-gray-800 border-gray-200/80 hover:bg-white hover:scale-102"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors",
                      isSelected
                        ? "bg-teal-400 text-teal-950 font-black"
                        : "bg-teal-100 text-teal-800 group-hover:bg-teal-600 group-hover:text-white"
                    )}
                  >
                    {stopNumber}
                  </div>
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-bold truncate max-w-[120px]">
                      {cityName}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] truncate max-w-[120px]",
                        isSelected ? "text-teal-200" : "text-gray-500"
                      )}
                    >
                      {stop.city?.country || "Destination"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
