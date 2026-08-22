"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Globe2,
  Heart,
  MapPin,
  Calendar,
  Sparkles,
  Star,
  Luggage,
  Compass,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { publicWishlistApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import { formatMoney } from "@/lib/format";
import Footer from "@/components/Footer";

export default function PublicWishlistPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ user: any; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicWishlistApi
      .get(token)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-primary-600 font-bold text-lg">
              <Globe2 className="w-6 h-6" /> GlobeTrotter
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-primary-600 px-3 py-1.5"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="text-xs sm:text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <LoadingSpinner label="Loading shared travel bucket list..." />
            </div>
          ) : !data ? (
            <EmptyState
              title="Wishlist Not Found"
              description="This wishlist may be private or the link has expired."
              action={{
                label: "Explore Destinations",
                onClick: () => (window.location.href = "/explore/cities"),
              }}
            />
          ) : (
            <div className="space-y-8">
              {/* Header Hero */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950 via-primary-950 to-indigo-950 text-white p-6 sm:p-10 shadow-lift border border-white/10">
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                    <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                    <span>Shared Travel Wishlist</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                        {data.user?.name ? `${data.user.name}'s Bucket List` : "Dream Travel Wishlist"}
                      </h1>
                      <p className="text-sm text-rose-100/80 mt-1">
                        {data.items.length} curated dream destinations & bucket-list experiences
                      </p>
                    </div>

                    {data.user && (
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                        {data.user.image ? (
                          <img
                            src={data.user.image}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-rose-400"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-sm">
                            {data.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">{data.user.name}</p>
                          <p className="text-[10px] text-rose-200">GlobeTrotter Explorer</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Grid */}
              {data.items.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-12 text-center space-y-3">
                  <Heart className="w-12 h-12 text-rose-300 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-900">No public wishes yet</h3>
                  <p className="text-xs text-gray-500">This traveler hasn&apos;t published any bucket-list items yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.items.map((item) => {
                    const priorityStars = "★".repeat(item.priority || 1);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-lift transition-all overflow-hidden flex flex-col group"
                      >
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

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35" />

                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                            <div className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-sm backdrop-blur-md flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-white" />
                              <span>{item.category}</span>
                            </div>

                            <div className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-400 text-amber-950 shadow-sm backdrop-blur-md">
                              {priorityStars}
                            </div>
                          </div>

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

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-base font-extrabold text-gray-900 font-display">
                              {item.title}
                            </h3>

                            {item.notes && (
                              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
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

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-gray-400 font-medium block">Est. Budget</span>
                              <span className="font-bold text-gray-900">
                                {item.estimatedBudget
                                  ? formatMoney(item.estimatedBudget, item.currency || "USD")
                                  : "Flexible"}
                              </span>
                            </div>

                            <Link
                              href="/signup"
                              className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800"
                            >
                              <span>Plan Your Own</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
