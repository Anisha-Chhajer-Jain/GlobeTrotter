"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, ChevronDown, ChevronUp, Clock, MapPin, Pencil, GripVertical } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { tripsApi, tripActivitiesApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import ActivityEditModal from "@/components/itinerary/ActivityEditModal";
import { formatMoney, formatDayLabel } from "@/lib/format";
import { convertCurrency } from "@/lib/currency";

/**
 * Reorders just the ids belonging to one day within a stop's full,
 * day-spanning activity list — preserving every other day's relative
 * position. orderIndex is scoped to the whole stop, not to a single day, so
 * a day-local drag has to be merged back into the stop's global order.
 */
function mergeReorder(fullIds: string[], daySubsetIds: string[], newDayOrder: string[]): string[] {
  const subsetSet = new Set(daySubsetIds);
  let i = 0;
  return fullIds.map((id) => (subsetSet.has(id) ? newDayOrder[i++] : id));
}

function SortableCalendarActivity({
  ta,
  onEdit,
}: {
  ta: any;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ta.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>
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
      <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600">
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function TripCalendarPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingActivity, setEditingActivity] = useState<{ stop: any; ta: any } | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  function handleDayDragEnd(dayItems: any[], e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const dayIds = dayItems.map((a) => a.id);
    const oldIndex = dayIds.indexOf(active.id as string);
    const newIndex = dayIds.indexOf(over.id as string);
    const newDayOrder = arrayMove(dayIds, oldIndex, newIndex);

    // Group the day's (possibly multi-stop) items by stop, and only reorder
    // within each affected stop — orderIndex is scoped per stop, so a
    // cross-stop day can't be flattened into one reorder call.
    const stopIdsInDay = [...new Set(dayItems.map((a) => a.stop.id))];

    setTrip((t: any) => {
      const next = { ...t, stops: t.stops.map((s: any) => ({ ...s, activities: [...s.activities] })) };
      for (const stopId of stopIdsInDay) {
        const stop = next.stops.find((s: any) => s.id === stopId);
        if (!stop) continue;
        const fullIds = stop.activities.map((a: any) => a.id);
        const daySubsetIds = dayItems.filter((a) => a.stop.id === stopId).map((a) => a.id);
        const newDaySubsetOrder = newDayOrder.filter((id) => daySubsetIds.includes(id));
        const mergedIds = mergeReorder(fullIds, daySubsetIds, newDaySubsetOrder);
        const byId = new Map(stop.activities.map((a: any) => [a.id, a]));
        stop.activities = mergedIds.map((id) => byId.get(id));

        tripActivitiesApi.reorder(tripId, stopId, mergedIds).catch(() => {
          toast.error("Failed to save order — reloading");
          load();
        });
      }
      return next;
    });
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
                  <div className="p-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDayDragEnd(items, e)}>
                      <SortableContext items={items.map((a) => a.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {items.map((ta) => (
                            <SortableCalendarActivity key={ta.id} ta={ta} onEdit={() => setEditingActivity({ stop: ta.stop, ta })} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
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
