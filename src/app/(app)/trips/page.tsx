"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Map, Clock, CheckCircle2, ListFilter, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { tripsApi } from "@/lib/api-client";
import TripCard from "@/components/TripCard";
import { EmptyState, SkeletonCard } from "@/components/ui/Misc";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "all",       label: "All",       icon: ListFilter },
  { key: "ongoing",   label: "Ongoing",   icon: Clock },
  { key: "upcoming",  label: "Upcoming",  icon: SlidersHorizontal },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function TripsPage() {
  const [trips, setTrips]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState<TabKey>("all");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting]         = useState(false);
  const [copyingId, setCopyingId]       = useState<string | null>(null);

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

  const { all, ongoing, upcoming, completed } = useMemo(() => {
    const now = new Date();
    const ongoing: any[]   = [];
    const upcoming: any[]  = [];
    const completed: any[] = [];

    for (const trip of trips) {
      const start = trip.startDate ? new Date(trip.startDate) : null;
      const end   = trip.endDate   ? new Date(trip.endDate)   : null;
      if (trip.status === "COMPLETED" || (end && end < now)) {
        completed.push(trip);
      } else if (start && start <= now && (!end || end >= now)) {
        ongoing.push(trip);
      } else {
        upcoming.push(trip);
      }
    }
    return { all: trips, ongoing, upcoming, completed };
  }, [trips]);

  const visibleTrips: Record<TabKey, any[]> = { all, ongoing, upcoming, completed };
  const shown = visibleTrips[activeTab];

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
      toast.success("Trip duplicated!");
      load();
    } catch {
      toast.error("Failed to duplicate trip");
    } finally {
      setCopyingId(null);
    }
  }

  const counts: Record<TabKey, number> = {
    all:       all.length,
    ongoing:   ongoing.length,
    upcoming:  upcoming.length,
    completed: completed.length,
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ─── Page header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-600" /> My Trips
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/trips/new"
          className="btn-pill btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white font-semibold w-fit"
        >
          <Plus className="w-4 h-4" /> Plan New Trip
        </Link>
      </div>

      {/* ─── Search + Tabs row ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search trips…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="tab-bar overflow-x-auto shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn("tab-item flex items-center gap-1.5", activeTab === tab.key && "active")}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded-full leading-none",
                  activeTab === tab.key
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-500"
                )}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={Map}
          title={search ? "No trips match your search" : activeTab === "all" ? "No trips yet" : `No ${activeTab} trips`}
          description={
            search
              ? "Try a different search term or clear the filter."
              : "Start planning your next adventure with day-by-day itineraries and real-time ₹ budget tracking."
          }
          action={
            !search && activeTab === "all" ? (
              <Link
                href="/trips/new"
                className="btn-pill btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white"
              >
                <Plus className="w-4 h-4" /> Plan a trip
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((trip, i) => (
            <div key={trip.id} className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <TripCard
                trip={trip}
                onDelete={setDeleteTarget}
                onCopy={handleCopy}
                copying={copyingId === trip.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* ─── Confirm delete ──────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete trip"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete trip"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
