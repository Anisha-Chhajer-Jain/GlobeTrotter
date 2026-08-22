"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowRight, X } from "lucide-react";
import { tripsApi, stopsApi, tripActivitiesApi, ApiError } from "@/lib/api-client";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CitySearchPanel from "@/components/CitySearchPanel";
import ActivitySearchPanel from "@/components/ActivitySearchPanel";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "INR", "CAD"];

export default function NewTripPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"details" | "suggestions">("details");
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: searchParams?.get("startDate") || "",
    endDate: searchParams?.get("endDate") || "",
    budget: "",
    currency: "USD",
    coverImage: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [addingCityId, setAddingCityId] = useState<string | null>(null);
  const [addingActivityId, setAddingActivityId] = useState<string | null>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { trip: created } = await tripsApi.create({
        title: form.title,
        description: form.description || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        budget: form.budget ? Number(form.budget) : 0,
        currency: form.currency,
        coverImage: form.coverImage || undefined,
      });
      setTrip(created);
      setStep("suggestions");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors.length) {
          const fe: Record<string, string> = {};
          err.fieldErrors.forEach((f) => (fe[f.field] = f.message));
          setErrors(fe);
        } else {
          toast.error(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCity(city: any) {
    setAddingCityId(city.id);
    try {
      const { stop } = await stopsApi.create(trip.id, { cityId: city.id });
      setStops((prev) => [...prev, stop]);
      toast.success(`${city.name} added`);
    } catch {
      toast.error("Failed to add city");
    } finally {
      setAddingCityId(null);
    }
  }

  function removeStopChip(stopId: string) {
    setStops((prev) => prev.filter((s) => s.id !== stopId));
    stopsApi.remove(trip.id, stopId).catch(() => toast.error("Failed to remove stop"));
  }

  async function handleAddActivity(activity: any, stopId: string) {
    setAddingActivityId(activity.id);
    try {
      const { activity: ta } = await tripActivitiesApi.add(trip.id, stopId, { activityId: activity.id });
      setStops((prev) => prev.map((s) => (s.id === stopId ? { ...s, activities: [...(s.activities || []), ta] } : s)));
      toast.success(`${activity.name} added`);
    } catch {
      toast.error("Failed to add activity");
    } finally {
      setAddingActivityId(null);
    }
  }

  const lastStop = stops[stops.length - 1];

  if (step === "suggestions" && trip) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{trip.title}</h1>
          <p className="text-gray-500 text-sm">Suggestions for places to visit and activities to perform — add a few now, or skip and build the full itinerary next.</p>
        </div>

        {stops.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {stops.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium">
                {s.city.name}
                <button onClick={() => removeStopChip(s.id)} className="hover:text-primary-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Select a place</h2>
          <CitySearchPanel
            onAdd={handleAddCity}
            addedCityIds={stops.map((s) => s.cityId)}
            addingCityId={addingCityId}
          />
        </div>

        {lastStop && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Activities to perform in {lastStop.city.name}</h2>
            <ActivitySearchPanel
              cityId={lastStop.cityId}
              onAdd={(activity) => handleAddActivity(activity, lastStop.id)}
              addedActivityIds={(lastStop.activities || []).map((a: any) => a.activityId)}
              addingActivityId={addingActivityId}
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/trips")}>
            Skip for now
          </Button>
          <Button onClick={() => router.push(`/trips/${trip.id}/build`)}>
            Continue to Itinerary Builder <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Plan a New Trip</h1>
      <p className="text-gray-500 text-sm mb-6">Give your trip a name and some basic details — you&apos;ll pick places and activities next.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <Input
          label="Trip name"
          required
          placeholder="Romantic European Adventure"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          error={errors.title}
        />
        <Textarea
          label="Description"
          rows={3}
          placeholder="What's this trip about?"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          error={errors.description}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            error={errors.startDate}
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            error={errors.endDate}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            error={errors.budget}
          />
          <Select label="Currency" value={form.currency} onChange={(e) => update("currency", e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Cover photo URL (optional)"
          placeholder="https://..."
          value={form.coverImage}
          onChange={(e) => update("coverImage", e.target.value)}
          error={errors.coverImage}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading}>
            Save & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
