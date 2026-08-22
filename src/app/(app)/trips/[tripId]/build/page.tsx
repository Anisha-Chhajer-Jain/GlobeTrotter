"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, ArrowLeft, Eye, Wallet, CalendarDays, Share2 } from "lucide-react";
import { tripsApi, stopsApi, tripActivitiesApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CitySearchPanel from "@/components/CitySearchPanel";
import ActivitySearchPanel from "@/components/ActivitySearchPanel";
import SortableStopCard from "@/components/itinerary/SortableStopCard";
import ActivityEditModal from "@/components/itinerary/ActivityEditModal";
import { formatDateRange } from "@/lib/format";

export default function TripBuilderPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addingCityId, setAddingCityId] = useState<string | null>(null);

  const [activityStop, setActivityStop] = useState<any>(null);
  const [addingActivityId, setAddingActivityId] = useState<string | null>(null);

  const [editingActivity, setEditingActivity] = useState<{ stop: any; ta: any } | null>(null);
  const [savingActivity, setSavingActivity] = useState(false);

  const [deleteStopTarget, setDeleteStopTarget] = useState<any>(null);
  const [deleteActivityTarget, setDeleteActivityTarget] = useState<{ stop: any; ta: any } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function load() {
    setLoading(true);
    try {
      const { trip } = await tripsApi.get(tripId);
      setTrip(trip);
    } catch {
      toast.error("Trip not found");
      router.push("/trips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleAddStop(city: any) {
    setAddingCityId(city.id);
    try {
      const { stop } = await stopsApi.create(tripId, { cityId: city.id });
      setTrip((t: any) => ({ ...t, stops: [...t.stops, stop] }));
      toast.success(`${city.name} added to your trip`);
    } catch {
      toast.error("Failed to add stop");
    } finally {
      setAddingCityId(null);
    }
  }

  function handleStopDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setTrip((t: any) => {
      const ids = t.stops.map((s: any) => s.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      const newStops = arrayMove(t.stops, oldIndex, newIndex);
      stopsApi.reorder(tripId, newStops.map((s: any) => s.id)).catch(() => toast.error("Failed to save order"));
      return { ...t, stops: newStops };
    });
  }

  async function handleDeleteStop() {
    const stop = deleteStopTarget;
    if (!stop) return;
    try {
      await stopsApi.remove(tripId, stop.id);
      setTrip((t: any) => ({ ...t, stops: t.stops.filter((s: any) => s.id !== stop.id) }));
      toast.success("Stop removed");
    } catch {
      toast.error("Failed to remove stop");
    } finally {
      setDeleteStopTarget(null);
    }
  }

  async function handleUpdateStopDates(stop: any, arrivalDate: string, departureDate: string) {
    setTrip((t: any) => ({
      ...t,
      stops: t.stops.map((s: any) => (s.id === stop.id ? { ...s, arrivalDate, departureDate } : s)),
    }));
    try {
      await stopsApi.update(tripId, stop.id, {
        arrivalDate: arrivalDate || null,
        departureDate: departureDate || null,
      });
    } catch {
      toast.error("Failed to update dates");
    }
  }

  async function handleAddActivity(activity: any) {
    if (!activityStop) return;
    setAddingActivityId(activity.id);
    try {
      const { activity: ta } = await tripActivitiesApi.add(tripId, activityStop.id, { activityId: activity.id });
      setTrip((t: any) => ({
        ...t,
        stops: t.stops.map((s: any) => (s.id === activityStop.id ? { ...s, activities: [...s.activities, ta] } : s)),
      }));
      setActivityStop((s: any) => (s ? { ...s, activities: [...s.activities, ta] } : s));
      toast.success(`${activity.name} added`);
    } catch {
      toast.error("Failed to add activity");
    } finally {
      setAddingActivityId(null);
    }
  }

  function handleReorderActivities(stop: any, activityIds: string[]) {
    setTrip((t: any) => ({
      ...t,
      stops: t.stops.map((s: any) => {
        if (s.id !== stop.id) return s;
        const byId = new Map(s.activities.map((a: any) => [a.id, a]));
        return { ...s, activities: activityIds.map((id) => byId.get(id)) };
      }),
    }));
    tripActivitiesApi.reorder(tripId, stop.id, activityIds).catch(() => toast.error("Failed to save order"));
  }

  async function handleSaveActivity(data: any) {
    if (!editingActivity) return;
    const { stop, ta } = editingActivity;
    setSavingActivity(true);
    try {
      const { activity: updated } = await tripActivitiesApi.update(ta.id, data);
      setTrip((t: any) => ({
        ...t,
        stops: t.stops.map((s: any) =>
          s.id !== stop.id ? s : { ...s, activities: s.activities.map((a: any) => (a.id === ta.id ? updated : a)) }
        ),
      }));
      toast.success("Activity updated");
      setEditingActivity(null);
    } catch {
      toast.error("Failed to update activity");
    } finally {
      setSavingActivity(false);
    }
  }

  async function handleDeleteActivity() {
    if (!deleteActivityTarget) return;
    const { stop, ta } = deleteActivityTarget;
    try {
      await tripActivitiesApi.remove(ta.id);
      setTrip((t: any) => ({
        ...t,
        stops: t.stops.map((s: any) => (s.id !== stop.id ? s : { ...s, activities: s.activities.filter((a: any) => a.id !== ta.id) })),
      }));
      toast.success("Activity removed");
    } catch {
      toast.error("Failed to remove activity");
    } finally {
      setDeleteActivityTarget(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading itinerary..." />;
  if (!trip) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to trips
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatDateRange(trip.startDate, trip.endDate)}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/trips/${tripId}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-3.5 h-3.5" /> View
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/calendar`}>
              <Button variant="outline" size="sm">
                <CalendarDays className="w-3.5 h-3.5" /> Calendar
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/budget`}>
              <Button variant="outline" size="sm">
                <Wallet className="w-3.5 h-3.5" /> Budget
              </Button>
            </Link>
            <Link href={`/trips/${tripId}/share`}>
              <Button variant="outline" size="sm">
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {trip.stops.length === 0 ? (
        <EmptyState
          title="No stops yet"
          description="Add your first city to start building this itinerary."
          action={
            <Button className="mt-2" onClick={() => setAddStopOpen(true)}>
              <Plus className="w-4 h-4" /> Add Stop
            </Button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStopDragEnd}>
          <SortableContext items={trip.stops.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {trip.stops.map((stop: any, i: number) => (
                <SortableStopCard
                  key={stop.id}
                  stop={stop}
                  index={i}
                  onDeleteStop={setDeleteStopTarget}
                  onUpdateStopDates={handleUpdateStopDates}
                  onAddActivity={setActivityStop}
                  onEditActivity={(stop, ta) => setEditingActivity({ stop, ta })}
                  onDeleteActivity={(stop, ta) => setDeleteActivityTarget({ stop, ta })}
                  onReorderActivities={handleReorderActivities}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {trip.stops.length > 0 && (
        <Button variant="outline" className="w-full" onClick={() => setAddStopOpen(true)}>
          <Plus className="w-4 h-4" /> Add Stop
        </Button>
      )}

      <Modal open={addStopOpen} onClose={() => setAddStopOpen(false)} title="Add a City" size="xl">
        <CitySearchPanel
          onAdd={(city) => handleAddStop(city)}
          addedCityIds={trip.stops.map((s: any) => s.cityId)}
          addingCityId={addingCityId}
        />
      </Modal>

      <Modal open={!!activityStop} onClose={() => setActivityStop(null)} title={`Add Activity in ${activityStop?.city?.name ?? ""}`} size="xl">
        {activityStop && (
          <ActivitySearchPanel
            cityId={activityStop.cityId}
            onAdd={handleAddActivity}
            addedActivityIds={activityStop.activities.map((a: any) => a.activityId)}
            addingActivityId={addingActivityId}
          />
        )}
      </Modal>

      <ActivityEditModal
        open={!!editingActivity}
        tripActivity={editingActivity?.ta}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveActivity}
        saving={savingActivity}
      />

      <ConfirmDialog
        open={!!deleteStopTarget}
        title="Remove stop"
        message={`Remove ${deleteStopTarget?.city?.name} and all its activities from this trip?`}
        confirmLabel="Remove"
        onConfirm={handleDeleteStop}
        onCancel={() => setDeleteStopTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteActivityTarget}
        title="Remove activity"
        message={`Remove "${deleteActivityTarget?.ta?.activity?.name}" from this stop?`}
        confirmLabel="Remove"
        onConfirm={handleDeleteActivity}
        onCancel={() => setDeleteActivityTarget(null)}
      />
    </div>
  );
}
