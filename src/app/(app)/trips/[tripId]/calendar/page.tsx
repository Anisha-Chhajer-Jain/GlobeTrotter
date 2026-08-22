"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronDown, ChevronUp, Clock, MapPin, Pencil } from "lucide-react";
import { tripsApi, tripActivitiesApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import ActivityEditModal from "@/components/itinerary/ActivityEditModal";
import { formatMoney, formatDayLabel } from "@/lib/format";
import { convertCurrency } from "@/lib/currency";

export default function TripCalendarPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingActivity, setEditingActivity] = useState<{ stop: any; ta: any } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { trip } = await tripsApi.get(tripId);
      setTrip(trip);
    } catch {
      toast.error("Failed to load trip");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (loading) return <LoadingSpinner label="Loading calendar..." />;
  if (!trip) return <EmptyState title="Trip not found" />;

  const allActivities = trip.stops.flatMap((stop: any) => stop.activities.map((a: any) => ({ ...a, stop })));

  const dayGroups = new Map<string, any[]>();
  for (const a of allActivities) {
    const key = a.scheduledDate ? new Date(a.scheduledDate).toISOString().split("T")[0] : "unscheduled";
    if (!dayGroups.has(key)) dayGroups.set(key, []);
    dayGroups.get(key)!.push(a);
  }
  const sortedDays = [...dayGroups.entries()].sort(([a], [b]) => (a === "unscheduled" ? 1 : b === "unscheduled" ? -1 : a.localeCompare(b)));

  function toggleDay(day: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }

  async function handleSaveActivity(data: any) {
    if (!editingActivity) return;
    const { stop, ta } = editingActivity;
    setSaving(true);
    try {
      await tripActivitiesApi.update(ta.id, data);
      toast.success("Activity updated");
      setEditingActivity(null);
      load();
    } catch {
      toast.error("Failed to update activity");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/trips/${tripId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to itinerary
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{trip.title} — Timeline</h1>
      </div>

      {allActivities.length === 0 ? (
        <EmptyState title="Nothing scheduled yet" description="Add activities in the builder to see them here." />
      ) : (
        <div className="space-y-3">
          {sortedDays.map(([day, items]) => {
            const expanded = expandedDays.has(day) || expandedDays.size === 0;
            const dayTotal = items.reduce(
              (sum, ta) => sum + convertCurrency(Number(ta.actualCost ?? ta.activity.cost ?? 0), ta.activity.currency, trip.currency),
              0
            );
            return (
              <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50"
                >
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{day === "unscheduled" ? "Unscheduled" : formatDayLabel(day)}</p>
                    <p className="text-xs text-gray-500">
                      {items.length} {items.length === 1 ? "activity" : "activities"} · {formatMoney(dayTotal, trip.currency)}
                    </p>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {expanded && (
                  <div className="p-4 space-y-2">
                    {items
                      .slice()
                      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
                      .map((ta) => (
                        <div key={ta.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{ta.activity.name}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {ta.stop.city?.name}
                              </span>
                              {ta.startTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {ta.startTime}
                                  {ta.endTime ? ` - ${ta.endTime}` : ""}
                                </span>
                              )}
                              <span>{formatMoney(ta.actualCost ?? ta.activity.cost, ta.activity.currency)}</span>
                            </div>
                          </div>
                          <Badge tone="gray">{ta.activity.type}</Badge>
                          <button
                            onClick={() => setEditingActivity({ stop: ta.stop, ta })}
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ActivityEditModal
        open={!!editingActivity}
        tripActivity={editingActivity?.ta}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveActivity}
        saving={saving}
      />
    </div>
  );
}
