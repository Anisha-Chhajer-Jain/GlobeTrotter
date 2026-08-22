"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { tripsApi, ApiError } from "@/lib/api-client";
import { Input, Textarea, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "INR", "CAD"];

export default function NewTripPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    currency: "USD",
    coverImage: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { trip } = await tripsApi.create({
        title: form.title,
        description: form.description || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        budget: form.budget ? Number(form.budget) : 0,
        currency: form.currency,
        coverImage: form.coverImage || undefined,
      });
      toast.success("Trip created! Let's build your itinerary.");
      router.push(`/trips/${trip.id}/build`);
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Plan a New Trip</h1>
      <p className="text-gray-500 text-sm mb-6">Give your trip a name and some basic details — you can add stops and activities next.</p>

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
