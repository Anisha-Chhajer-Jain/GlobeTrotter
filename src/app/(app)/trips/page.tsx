"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Map } from "lucide-react";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api-client";
import TripCard from "@/components/TripCard";
import { EmptyState, CardSkeletonGrid } from "@/components/ui/Misc";
import { Input } from "@/components/ui/Input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await tripsApi.list({ search: search || undefined, limit: 100 });
      setTrips(res.trips);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const { ongoing, upcoming, completed } = useMemo(() => {
    const now = new Date();
    const ongoing: any[] = [];
    const upcoming: any[] = [];
    const completed: any[] = [];

    for (const trip of trips) {
      const start = trip.startDate ? new Date(trip.startDate) : null;
      const end = trip.endDate ? new Date(trip.endDate) : null;

      if (trip.status === "COMPLETED" || (end && end < now)) {
        completed.push(trip);
      } else if (start && start <= now && (!end || end >= now)) {
        ongoing.push(trip);
      } else {
        upcoming.push(trip);
      }
    }
    return { ongoing, upcoming, completed };
  }, [trips]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tripsApi.remove(deleteTarget.id);
      setTrips((t) => t.filter((tr) => tr.id !== deleteTarget.id));
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleCopy(trip: any) {
    setCopyingId(trip.id);
    try {
      await tripsApi.copy(trip.id);
      toast.success("Trip duplicated");
      load();
    } catch {
      toast.error("Failed to duplicate trip");
    } finally {
      setCopyingId(null);
    }
  }

  function TripGroup({ title, items }: { title: string; items: any[] }) {
    if (items.length === 0) return null;
    return (
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={setDeleteTarget} onCopy={handleCopy} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
        <Link
          href="/trips/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 shadow-sm shadow-primary-200 w-fit"
        >
          <Plus className="w-4 h-4" /> Plan New Trip
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <CardSkeletonGrid count={6} />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No trips found"
          description="Create your first trip to start planning."
          action={
            <Link href="/trips/new" className="mt-2 text-sm text-primary-600 font-semibold hover:underline">
              Plan a trip →
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <TripGroup title="Ongoing" items={ongoing} />
          <TripGroup title="Upcoming" items={upcoming} />
          <TripGroup title="Completed" items={completed} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete trip"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
