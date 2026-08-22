"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Plus,
  Share2,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Filter,
  DollarSign,
  Trash2,
  Pencil,
  ArrowRight,
  ExternalLink,
  Compass,
  Star,
  Check,
  Copy,
  MessageCircle,
  Send,
  X,
  Luggage,
} from "lucide-react";
import toast from "react-hot-toast";
import { wishlistApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { id: "ALL", label: "All Items", icon: Sparkles },
  { id: "Destination", label: "Destinations", icon: MapPin },
  { id: "Activity", label: "Activities", icon: Compass },
  { id: "Stay", label: "Stays & Hotels", icon: Luggage },
  { id: "Dining", label: "Culinary & Dining", icon: Heart },
  { id: "Adventure", label: "Adventures", icon: Star },
];

const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "Anytime", "2026", "2027"];

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{ token: string; shareUrl: string } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    category: "Destination",
    cityName: "",
    country: "",
    estimatedBudget: "",
    currency: "USD",
    priority: 3,
    season: "Spring 2026",
    notes: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadWishlist() {
    try {
      setLoading(true);
      const res = await wishlistApi.list({
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
        priority: selectedPriority !== "ALL" ? selectedPriority : undefined,
        search: search.trim() || undefined,
      });
      setItems(res.items || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, [selectedCategory, selectedPriority]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadWishlist();
  }

  function openCreateModal(itemToEdit: any = null) {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setFormData({
        title: itemToEdit.title,
        category: itemToEdit.category || "Destination",
        cityName: itemToEdit.cityName || "",
        country: itemToEdit.country || "",
        estimatedBudget: itemToEdit.estimatedBudget ? String(itemToEdit.estimatedBudget) : "",
        currency: itemToEdit.currency || "USD",
        priority: itemToEdit.priority || 2,
        season: itemToEdit.season || "",
        notes: itemToEdit.notes || "",
        imageUrl: itemToEdit.imageUrl || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        category: "Destination",
        cityName: "",
        country: "",
        estimatedBudget: "",
        currency: "USD",
        priority: 3,
        season: "Summer 2026",
        notes: "",
        imageUrl: "",
      });
    }
    setIsCreateOpen(true);
  }

  async function handleSubmitWish(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your wish");
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await wishlistApi.update(editingItem.id, formData);
        toast.success("Wishlist item updated!");
      } else {
        await wishlistApi.create(formData);
        toast.success("Added to your wishlist!");
      }
      setIsCreateOpen(false);
      loadWishlist();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save wishlist item");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this item from your wishlist?")) return;
    try {
      await wishlistApi.remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed from wishlist");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item");
    }
  }

  async function handleShareWishlist() {
    try {
      const res = await wishlistApi.share(true);
      setShareData(res);
      setIsShareOpen(true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate share link");
    }
  }

  function copyShareUrl() {
    if (!shareData) return;
    const fullUrl = `${window.location.origin}${shareData.shareUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setShareCopied(true);
    toast.success("Wishlist link copied to clipboard!");
    setTimeout(() => setShareCopied(false), 2000);
  }

  // Calculate statistics
  const totalBudget = items.reduce((acc, item) => {
    return acc + Number(item.estimatedBudget || 0);
  }, 0);

  const highPriorityCount = items.filter((i) => i.priority === 3).length;
  const uniqueCountries = new Set(items.map((i) => i.country).filter(Boolean)).size;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* 🌟 Signature Wishlist Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950 via-primary-950 to-indigo-950 text-white p-6 sm:p-10 shadow-lift border border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.25),rgba(255,255,255,0))]" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>Travel Bucket List</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Dream Journeys & Wishlist
              </h1>
              <p className="text-sm text-rose-100/80 max-w-xl leading-relaxed">
                Curate future destinations, bucket-list adventures, and must-visit spots. Convert any dream into a full itinerary with a single click.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => openCreateModal()}
                className="bg-rose-500 hover:bg-rose-600 text-white border-none rounded-2xl font-bold shadow-lg shadow-rose-900/30 px-5 py-2.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add New Wish
              </Button>

              <Button
                variant="outline"
                onClick={handleShareWishlist}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl font-semibold backdrop-blur-md px-4 py-2.5"
              >
                <Share2 className="w-4 h-4 text-rose-300" /> Share Bucket List
              </Button>
            </div>
          </div>

          {/* 💎 4 Elevated Stat Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-rose-200/70 font-semibold uppercase tracking-wider">Total Wishes</p>
              <p className="text-2xl font-black text-white font-display mt-0.5">{items.length}</p>
              <p className="text-[10px] text-white/60">Saved experiences</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-rose-200/70 font-semibold uppercase tracking-wider">Top Priority</p>
              <p className="text-2xl font-black text-rose-300 font-display mt-0.5">{highPriorityCount}</p>
              <p className="text-[10px] text-white/60">Must-do in 2026</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-rose-200/70 font-semibold uppercase tracking-wider">Estimated Budget</p>
              <p className="text-2xl font-black text-white font-display mt-0.5 truncate">{formatMoney(totalBudget, "USD")}</p>
              <p className="text-[10px] text-white/60">Across bucket list</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-rose-200/70 font-semibold uppercase tracking-wider">Countries</p>
              <p className="text-2xl font-black text-teal-300 font-display mt-0.5">{uniqueCountries}</p>
              <p className="text-[10px] text-white/60">On your radar</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Search & Category Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories Pill Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0",
                    active
                      ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-xs"
                      : "text-gray-600 hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <cat.icon className={cn("w-3.5 h-3.5", active ? "text-rose-600" : "text-gray-400")} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Priority & Search */}
          <div className="flex items-center gap-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="ALL">All Priorities</option>
              <option value="3">★★★ High Priority</option>
              <option value="2">★★ Medium Priority</option>
              <option value="1">★ Low Priority</option>
            </select>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[200px] flex-1">
              <input
                type="text"
                placeholder="Search wishes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200/80 text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </form>
          </div>
        </div>
      </div>

      {/* 💖 Wishlist Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner label="Loading your wishlist..." />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Start adding your dream destinations, scenic road trips, and bucket-list adventures.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => openCreateModal()}
            className="bg-rose-500 text-white hover:bg-rose-600 rounded-2xl font-bold shadow-md shadow-rose-900/20"
          >
            <Plus className="w-4 h-4" /> Add Your First Wish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.map((item) => {
              const priorityStars = "★".repeat(item.priority || 1);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl border border-gray-100/90 shadow-soft hover:shadow-lift hover:border-rose-200 transition-all duration-300 overflow-hidden flex flex-col group relative"
                >
                  {/* Card Cover Image */}
                  <div className="h-44 bg-gradient-to-br from-rose-900 via-primary-950 to-indigo-950 relative overflow-hidden">
                    {item.imageUrl || item.city?.imageUrl ? (
                      <img
                        src={item.imageUrl || item.city?.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-rose-300/40 p-4">
                        <Compass className="w-12 h-12 stroke-[1.2] mb-1" />
                        <span className="text-[10px] font-bold text-rose-200/60 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Gradient Mask */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-sm backdrop-blur-md flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-white" />
                        <span>{item.category}</span>
                      </div>

                      <div className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-sm backdrop-blur-md">
                        {priorityStars} Priority
                      </div>
                    </div>

                    {/* Bottom City Name on image */}
                    {(item.cityName || item.country) && (
                      <div className="absolute bottom-3 left-3.5 right-3.5">
                        <p className="text-xs font-bold text-white flex items-center gap-1 drop-shadow-md">
                          <MapPin className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          <span>
                            {item.cityName}
                            {item.cityName && item.country ? `, ${item.country}` : item.country}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-extrabold text-gray-900 font-display line-clamp-2">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openCreateModal(item)}
                            className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Edit Wish"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Remove Wish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      {item.season && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Target: {item.season}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer: Budget & Convert to Trip CTA */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-medium block">Est. Budget</span>
                        <span className="text-xs font-bold text-gray-900">
                          {item.estimatedBudget
                            ? formatMoney(item.estimatedBudget, item.currency || "USD")
                            : "Flexible"}
                        </span>
                      </div>

                      <Link
                        href={`/trips/new?title=${encodeURIComponent(item.title)}&city=${encodeURIComponent(
                          item.cityName || ""
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-xs group-hover:scale-102"
                      >
                        <span>Plan Trip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 📝 Modal: Add / Edit Wish */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-md shadow-rose-900/20">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 font-display">
                    {editingItem ? "Edit Wishlist Item" : "Add to Travel Wishlist"}
                  </h3>
                  <p className="text-xs text-gray-500">Save a dream place, sight, or experience</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWish} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Wish Title / Experience *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba Diving Great Barrier Reef or Kyoto Sakura Tour"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 outline-none"
                  >
                    <option value="Destination">Destination</option>
                    <option value="Activity">Activity</option>
                    <option value="Stay">Stay & Villa</option>
                    <option value="Dining">Culinary & Wine</option>
                    <option value="Adventure">Adventure & Trek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 outline-none"
                  >
                    <option value="3">★★★ Top Priority</option>
                    <option value="2">★★ Medium Priority</option>
                    <option value="1">★ Low Priority</option>
                  </select>
                </div>
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Kyoto"
                    value={formData.cityName}
                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Japan"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none"
                  />
                </div>
              </div>

              {/* Estimated Budget & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Budget</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 outline-none"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Season & Image URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Season / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. Spring 2026"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Personal Notes & Ideas</label>
                <textarea
                  rows={2}
                  placeholder="Tips, links, sights to check out, best local food..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" loading={submitting} className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl font-bold">
                  {editingItem ? "Save Changes" : "Add to Wishlist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔗 Modal: Share Wishlist */}
      {isShareOpen && shareData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 font-display">Share Your Wishlist</h3>
                  <p className="text-xs text-gray-500">Inspire friends with your travel bucket list</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
              <p className="text-[11px] text-gray-500 font-semibold uppercase">Public Shareable Link</p>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-700 truncate font-mono">
                  {typeof window !== "undefined" ? `${window.location.origin}${shareData.shareUrl}` : ""}
                </span>
                <button
                  onClick={copyShareUrl}
                  className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1"
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{shareCopied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-700">Direct Share</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const url = encodeURIComponent(`${window.location.origin}${shareData.shareUrl}`);
                    window.open(`https://wa.me/?text=Check%20out%20my%20Travel%20Wishlist!%20${url}`, "_blank");
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button
                  onClick={() => {
                    const url = encodeURIComponent(`${window.location.origin}${shareData.shareUrl}`);
                    window.open(`https://twitter.com/intent/tweet?text=Check%20out%20my%20Travel%20Wishlist!&url=${url}`, "_blank");
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs hover:bg-sky-100 transition-colors"
                >
                  <Send className="w-4 h-4" /> X (Twitter)
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsShareOpen(false)}
              className="w-full rounded-xl text-xs font-bold"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
