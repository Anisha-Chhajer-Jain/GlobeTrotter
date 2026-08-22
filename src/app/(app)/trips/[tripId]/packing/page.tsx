"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Trash2, Sparkles, Luggage } from "lucide-react";
import { tripsApi, packingApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

const CATEGORY_LABELS: Record<string, string> = {
  CLOTHING: "Clothing",
  DOCUMENTS: "Documents",
  ELECTRONICS: "Electronics",
  TOILETRIES: "Toiletries",
  HEALTH: "Health",
  MISCELLANEOUS: "Miscellaneous",
};

const CATEGORY_ORDER = ["DOCUMENTS", "CLOTHING", "TOILETRIES", "ELECTRONICS", "HEALTH", "MISCELLANEOUS"];

const ESSENTIALS: { name: string; category: string }[] = [
  { name: "Passport / ID", category: "DOCUMENTS" },
  { name: "Travel insurance printout", category: "DOCUMENTS" },
  { name: "Flight / train tickets", category: "DOCUMENTS" },
  { name: "Phone charger", category: "ELECTRONICS" },
  { name: "Power adapter", category: "ELECTRONICS" },
  { name: "Toothbrush & toothpaste", category: "TOILETRIES" },
  { name: "Sunscreen", category: "TOILETRIES" },
  { name: "Medication", category: "HEALTH" },
  { name: "Underwear (per day)", category: "CLOTHING" },
  { name: "Comfortable walking shoes", category: "CLOTHING" },
];

export default function PackingListPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("MISCELLANEOUS");
  const [adding, setAdding] = useState(false);
  const [addingEssentials, setAddingEssentials] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [{ trip }, { items }] = await Promise.all([tripsApi.get(tripId), packingApi.list(tripId)]);
      setTrip(trip);
      setItems(items);
    } catch {
      toast.error("Failed to load packing list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const item of items) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({ category: c, items: map.get(c)! }));
  }, [items]);

  const packedCount = items.filter((i) => i.packed).length;
  const pct = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const { item } = await packingApi.create(tripId, { name: name.trim(), category });
      setItems((prev) => [...prev, item]);
      setName("");
    } catch {
      toast.error("Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(item: any) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)));
    try {
      await packingApi.update(tripId, item.id, { packed: !item.packed });
    } catch {
      toast.error("Failed to update item");
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: item.packed } : i)));
    }
  }

  async function handleDelete(item: any) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    try {
      await packingApi.remove(tripId, item.id);
    } catch {
      toast.error("Failed to delete item");
      load();
    }
  }

  async function handleAddEssentials() {
    setAddingEssentials(true);
    try {
      const existingNames = new Set(items.map((i) => i.name.toLowerCase()));
      const toAdd = ESSENTIALS.filter((e) => !existingNames.has(e.name.toLowerCase()));
      const created = await Promise.all(toAdd.map((e) => packingApi.create(tripId, e)));
      setItems((prev) => [...prev, ...created.map((c) => c.item)]);
      if (toAdd.length === 0) toast("Essentials are already on your list");
      else toast.success(`Added ${toAdd.length} essentials`);
    } catch {
      toast.error("Failed to add essentials");
    } finally {
      setAddingEssentials(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading packing list..." />;
  if (!trip) return <EmptyState title="Trip not found" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/trips/${tripId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to itinerary
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Luggage className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packing list</h1>
            <p className="text-sm text-gray-500">{trip.title}</p>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">
              {packedCount} of {items.length} packed
            </span>
            <span className="font-bold text-primary-600">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Add an item..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-40">
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
        <Button type="submit" loading={adding} disabled={!name.trim()}>
          <Plus className="w-4 h-4" /> Add
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={Luggage}
          title="Nothing packed yet"
          description="Add items one by one, or start from a quick essentials list."
          action={
            <Button variant="outline" size="sm" className="mt-2" onClick={handleAddEssentials} loading={addingEssentials}>
              <Sparkles className="w-3.5 h-3.5" /> Add essentials
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={handleAddEssentials} loading={addingEssentials}>
              <Sparkles className="w-3.5 h-3.5" /> Add essentials
            </Button>
          </div>
          <div className="space-y-6">
            {grouped.map(({ category, items: catItems }) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-gray-700 mb-2">{CATEGORY_LABELS[category]}</h3>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3 group">
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => handleToggle(item)}
                        className="w-4.5 h-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                      />
                      <span
                        className={`flex-1 text-sm ${item.packed ? "text-gray-400 line-through" : "text-gray-800"}`}
                      >
                        {item.name}
                        {item.quantity > 1 && <span className="text-gray-400"> × {item.quantity}</span>}
                      </span>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
