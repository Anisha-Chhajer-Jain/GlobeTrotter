"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Luggage,
  FileText,
  Shirt,
  Zap,
  Droplet,
  HeartPulse,
  Package,
  PartyPopper,
  Check,
} from "lucide-react";
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

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  DOCUMENTS: FileText,
  CLOTHING: Shirt,
  ELECTRONICS: Zap,
  TOILETRIES: Droplet,
  HEALTH: HeartPulse,
  MISCELLANEOUS: Package,
};

const CATEGORY_TONES: Record<string, { bg: string; text: string; ring: string }> = {
  DOCUMENTS: { bg: "bg-primary-50", text: "text-primary-600", ring: "ring-primary-200" },
  CLOTHING: { bg: "bg-accent-50", text: "text-accent-600", ring: "ring-accent-200" },
  ELECTRONICS: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
  TOILETRIES: { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-200" },
  HEALTH: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-200" },
  MISCELLANEOUS: { bg: "bg-gray-100", text: "text-gray-500", ring: "ring-gray-200" },
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

function ProgressRing({ pct }: { pct: number }) {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-100" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={pct === 100 ? "text-emerald-500" : "text-primary-500"}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {pct === 100 ? (
          <PartyPopper className="w-7 h-7 text-emerald-500" />
        ) : (
          <span className="text-lg font-bold text-gray-900">{pct}%</span>
        )}
      </div>
    </div>
  );
}

function PackingCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? "bg-primary-600 border-primary-600" : "border-gray-300 hover:border-primary-400"
      }`}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

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
    const wasComplete = pct === 100;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)));
    try {
      await packingApi.update(tripId, item.id, { packed: !item.packed });
      if (!wasComplete && packedCount + 1 === items.length && !item.packed) {
        toast.success("Everything's packed! 🎉");
      }
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
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shrink-0 shadow-soft">
            <Luggage className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Packing list</h1>
            <p className="text-sm text-gray-500">{trip.title}</p>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border shadow-sm p-5 flex items-center gap-5 transition-colors ${
            pct === 100
              ? "bg-gradient-to-br from-emerald-50 to-primary-50 border-emerald-100"
              : "bg-white border-gray-100"
          }`}
        >
          <ProgressRing pct={pct} />
          <div className="min-w-0">
            <p className="font-bold text-gray-900">
              {pct === 100 ? "Ready to go!" : `${packedCount} of ${items.length} packed`}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {pct === 100
                ? "Every item on your list is checked off."
                : `${items.length - packedCount} item${items.length - packedCount === 1 ? "" : "s"} left to pack.`}
            </p>
          </div>
        </motion.div>
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
            {grouped.map(({ category, items: catItems }, groupIndex) => {
              const Icon = CATEGORY_ICONS[category];
              const tone = CATEGORY_TONES[category];
              const catPacked = catItems.filter((i) => i.packed).length;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-lg ${tone.bg} ${tone.text} flex items-center justify-center shrink-0`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700">{CATEGORY_LABELS[category]}</h3>
                    <span className="text-xs text-gray-400">
                      {catPacked}/{catItems.length}
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                    <AnimatePresence initial={false}>
                      {catItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 px-4 py-3 group"
                        >
                          <PackingCheckbox checked={item.packed} onChange={() => handleToggle(item)} />
                          <span
                            className={`flex-1 text-sm transition-colors ${item.packed ? "text-gray-400 line-through" : "text-gray-800"}`}
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
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
