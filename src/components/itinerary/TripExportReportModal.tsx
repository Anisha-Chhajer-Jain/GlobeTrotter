"use client";

import { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  Calendar,
  MapPin,
  Clock,
  Wallet,
  Luggage,
  Sparkles,
  Plane,
  Compass,
  ArrowRight,
  Globe2,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Misc";
import { formatDateRange, formatDate, formatDayLabel, formatMoney, tripDurationDays } from "@/lib/format";
import { convertCurrency } from "@/lib/currency";

interface TripExportReportModalProps {
  trip: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TripExportReportModal({
  trip,
  isOpen,
  onClose,
}: TripExportReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const duration = tripDurationDays(trip.startDate, trip.endDate);
  const currency = trip.currency || "USD";

  // Build Day-by-Day sequence
  const allActivities = trip.stops?.flatMap((stop: any) =>
    stop.activities?.map((a: any) => ({ ...a, stop })) || []
  ) || [];

  // Group activities by date
  const dayMap = new Map<string, { date: Date | null; label: string; activities: any[]; city: string }>();

  // If start & end dates exist, generate full sequence from Day 1 to End Day
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const cur = new Date(start);

    while (cur <= end) {
      const dateStr = cur.toISOString().split("T")[0];
      // Find matching stop for this date
      const matchingStop = trip.stops?.find((s: any) => {
        if (!s.arrivalDate || !s.departureDate) return false;
        const arr = new Date(s.arrivalDate);
        const dep = new Date(s.departureDate);
        return cur >= arr && cur <= dep;
      });

      dayMap.set(dateStr, {
        date: new Date(cur),
        label: formatDayLabel(cur),
        activities: [],
        city: matchingStop?.city?.name || "Transit / Travel Day",
      });

      cur.setDate(cur.getDate() + 1);
    }
  }

  // Populate activities into days
  for (const a of allActivities) {
    if (a.scheduledDate) {
      const dateStr = new Date(a.scheduledDate).toISOString().split("T")[0];
      if (dayMap.has(dateStr)) {
        dayMap.get(dateStr)!.activities.push(a);
      } else {
        dayMap.set(dateStr, {
          date: new Date(a.scheduledDate),
          label: formatDayLabel(a.scheduledDate),
          activities: [a],
          city: a.stop?.city?.name || "Scheduled Stop",
        });
      }
    } else {
      // Unscheduled
      if (!dayMap.has("unscheduled")) {
        dayMap.set("unscheduled", {
          date: null,
          label: "Unscheduled Sights & Activities",
          activities: [],
          city: "Flexible",
        });
      }
      dayMap.get("unscheduled")!.activities.push(a);
    }
  }

  // Calculate total costs converted to trip primary currency
  const totalActivitiesCost = allActivities.reduce((acc: number, a: any) => {
    const cost = Number(a.actualCost ?? a.activity?.cost ?? 0);
    const actCurrency = a.activity?.currency || currency;
    return acc + convertCurrency(cost, actCurrency, currency);
  }, 0);

  function handlePrint() {
    window.print();
  }

  function handleDownloadMarkdown() {
    const md = generateMarkdownDossier();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${trip.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_itinerary_dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Itinerary Markdown downloaded!");
  }

  function handleCopyMarkdown() {
    const md = generateMarkdownDossier();
    navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success("Full itinerary dossier copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }

  function generateMarkdownDossier(): string {
    let md = `# 🌍 ${trip.title.toUpperCase()} — TRIP DOSSIER\n\n`;
    md += `**Status:** ${trip.status} | **Duration:** ${duration} Days | **Primary Currency:** ${currency}\n`;
    md += `**Dates:** ${formatDateRange(trip.startDate, trip.endDate)}\n`;
    md += `**Budget Goal:** ${formatMoney(trip.budget, currency)} | **Estimated Activity Spend:** ${formatMoney(totalActivitiesCost, currency)}\n\n`;

    if (trip.description) {
      md += `### 📝 Overview\n${trip.description}\n\n`;
    }

    md += `## 🗺️ Destinations & Route Schedule\n\n`;
    trip.stops?.forEach((stop: any, idx: number) => {
      md += `${idx + 1}. **${stop.city?.name}, ${stop.city?.country}** — ${formatDateRange(stop.arrivalDate, stop.departureDate)}\n`;
      if (stop.notes) md += `   *Notes:* ${stop.notes}\n`;
    });
    md += `\n---\n\n`;

    md += `## 📅 Day-by-Day Comprehensive Itinerary\n\n`;
    let dayIndex = 1;
    dayMap.forEach((dayInfo, _key) => {
      md += `### Day ${dayIndex}: ${dayInfo.label} (${dayInfo.city})\n\n`;
      if (dayInfo.activities.length === 0) {
        md += `*Free time / transit / leisure exploration.*\n\n`;
      } else {
        dayInfo.activities.forEach((act: any) => {
          const time = act.startTime ? `[${act.startTime}${act.endTime ? ` - ${act.endTime}` : ""}] ` : "";
          const cost = formatMoney(act.actualCost ?? act.activity?.cost, act.activity?.currency || currency);
          md += `- **${time}${act.activity?.name}** (${act.activity?.type || "Activity"}) — *${cost}*\n`;
          if (act.activity?.location) md += `  - 📍 *Location:* ${act.activity.location}\n`;
          if (act.notes) md += `  - 💡 *Note:* ${act.notes}\n`;
        });
        md += `\n`;
      }
      dayIndex++;
    });

    md += `\n---\n*Generated by GlobeTrotter Travel Planner*\n`;
    return md;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 printable-modal-overlay">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh] printable-modal-card">
        {/* Modal Header & Quick Action Buttons (Hidden on Print) */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/90 print-hide">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 font-display">
                Trip Dossier & Full Export Report
              </h3>
              <p className="text-xs text-gray-500">
                Day 1 to End Day comprehensive travel briefing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePrint}
              className="rounded-xl gap-1.5 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-500/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadMarkdown}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              <Download className="w-3.5 h-3.5" /> Download MD
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyMarkdown}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content Body */}
        <div id="trip-printable-report" className="p-6 sm:p-10 overflow-y-auto space-y-8 print:p-0 print:space-y-6">
          {/* Header Banner */}
          <div className="border-b border-gray-200 pb-6 space-y-4 print-avoid-break">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-700 font-extrabold text-xs uppercase tracking-wider">
                <Globe2 className="w-4 h-4 text-teal-600" />
                <span>GlobeTrotter Travel Dossier</span>
              </div>
              <Badge tone="blue">{trip.status}</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-display">
              {trip.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-150">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-black text-gray-900 mt-0.5">{duration} Days</p>
                <p className="text-[10px] text-gray-500">{formatDateRange(trip.startDate, trip.endDate)}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-150">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destinations</p>
                <p className="text-sm font-black text-gray-900 mt-0.5">{trip.stops?.length || 0} Cities</p>
                <p className="text-[10px] text-gray-500 truncate">
                  {trip.stops?.map((s: any) => s.city?.name).join(" → ")}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-150">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Budget Goal</p>
                <p className="text-sm font-black text-teal-700 mt-0.5">{formatMoney(trip.budget, currency)}</p>
                <p className="text-[10px] text-gray-500">Base Currency: {currency}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-150">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Spend</p>
                <p className="text-sm font-black text-indigo-700 mt-0.5">{formatMoney(totalActivitiesCost, currency)}</p>
                <p className="text-[10px] text-gray-500">{allActivities.length} Planned Sights</p>
              </div>
            </div>

            {trip.description && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-teal-50/60 p-3.5 rounded-2xl border border-teal-100">
                {trip.description}
              </p>
            )}
          </div>

          {/* Destination Route Summary */}
          {trip.stops?.length > 0 && (
            <div className="space-y-3 print-avoid-break">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider font-display flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Destination Route & Stay Schedule</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trip.stops.map((stop: any, idx: number) => (
                  <div
                    key={stop.id}
                    className="p-3 rounded-2xl border border-gray-150 bg-white flex items-center justify-between print-avoid-break"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                          {stop.city?.name}, {stop.city?.country}
                        </h4>
                        <p className="text-[10px] text-gray-500">
                          {formatDateRange(stop.arrivalDate, stop.departureDate)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">
                      {stop.activities?.length || 0} sights
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day-by-Day Comprehensive Itinerary Feed */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider font-display flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Full Day-by-Day Itinerary (Day 1 to End)</span>
            </h2>

            <div className="space-y-3">
              {Array.from(dayMap.entries()).map(([key, dayInfo], index) => {
                const dayCost = dayInfo.activities.reduce((acc, a) => {
                  const raw = Number(a.actualCost ?? a.activity?.cost ?? 0);
                  const actCurr = a.activity?.currency || currency;
                  return acc + convertCurrency(raw, actCurr, currency);
                }, 0);

                return (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white print-avoid-break"
                  >
                    {/* Day Header */}
                    <div className="bg-gray-50 px-3.5 py-2 flex items-center justify-between border-b border-gray-150">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-bold text-xs text-gray-900">
                          {dayInfo.label}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          • {dayInfo.city}
                        </span>
                      </div>

                      {dayCost > 0 && (
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          Est: {formatMoney(dayCost, currency)}
                        </span>
                      )}
                    </div>

                    {/* Day Activities List */}
                    <div className="p-3 space-y-1.5">
                      {dayInfo.activities.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic py-0.5 px-1">
                          No structured events scheduled. Free day for wandering, leisure, or culinary exploration.
                        </p>
                      ) : (
                        dayInfo.activities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-start justify-between gap-2 p-2 rounded-xl bg-gray-50/70 border border-gray-100"
                          >
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-gray-900">
                                  {act.activity?.name}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 bg-white px-1.5 py-0.2 rounded border border-gray-200">
                                  {act.activity?.type || "Activity"}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                {act.startTime && (
                                  <span className="flex items-center gap-1 font-semibold text-teal-700">
                                    <Clock className="w-2.5 h-2.5" />
                                    {act.startTime}
                                    {act.endTime ? ` - ${act.endTime}` : ""}
                                  </span>
                                )}
                                {act.activity?.location && (
                                  <span className="truncate">📍 {act.activity.location}</span>
                                )}
                              </div>

                              {act.notes && (
                                <p className="text-[10px] text-gray-500 italic pt-0.5">
                                  Note: {act.notes}
                                </p>
                              )}
                            </div>

                            <span className="text-[11px] font-bold text-gray-800 shrink-0 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                              {formatMoney(
                                act.actualCost ?? act.activity?.cost,
                                act.activity?.currency || currency
                              )}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer briefing signature */}
          <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 print-avoid-break">
            Generated by GlobeTrotter Travel Planner • Have a safe & memorable journey!
          </div>
        </div>
      </div>
    </div>
  );
}
