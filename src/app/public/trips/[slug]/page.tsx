"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Globe2, MapPin, Clock, Share2, Copy, Wallet } from "lucide-react";
import { publicTripApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import { formatDateRange, formatMoney } from "@/lib/format";

export default function PublicTripPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { status } = useSession();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    publicTripApi
      .get(slug)
      .then((res) => setTrip(res.trip))
      .catch(() => toast.error("This trip isn't available."))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleCopyTrip() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/public/trips/${slug}`);
      return;
    }
    setCopying(true);
    try {
      const { trip: newTrip } = await publicTripApi.copy(slug, { includeActivities: true });
      toast.success("Trip copied to your account!");
      router.push(`/trips/${newTrip.id}/build`);
    } catch {
      toast.error("Failed to copy trip");
    } finally {
      setCopying(false);
    }
  }

  function shareLink() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: trip?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
            <Globe2 className="w-6 h-6" /> GlobeTrotter
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <LoadingSpinner label="Loading trip..." />
        ) : !trip ? (
          <EmptyState title="Trip not available" description="This link may be invalid or the trip is no longer public." />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <Badge tone="blue">Shared Itinerary</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mt-3">{trip.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{formatDateRange(trip.startDate, trip.endDate)}</p>
              {trip.description && <p className="text-gray-600 mt-3">{trip.description}</p>}
              <p className="text-sm text-gray-500 mt-3">
                Created by <span className="font-medium text-gray-700">{trip.user?.name}</span>
              </p>
              <div className="flex gap-3 mt-5">
                <Button onClick={handleCopyTrip} loading={copying}>
                  <Copy className="w-4 h-4" /> Copy This Trip
                </Button>
                <Button variant="outline" onClick={shareLink}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <Wallet className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-bold text-gray-900">{formatMoney(trip.budget, trip.currency)}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Stops</p>
                  <p className="font-bold text-gray-900">{trip.stops.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {trip.stops.map((stop: any, i: number) => (
                <div key={stop.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" /> {stop.city?.name}, {stop.city?.country}
                      </h3>
                      <p className="text-xs text-gray-500">{formatDateRange(stop.arrivalDate, stop.departureDate)}</p>
                    </div>
                  </div>
                  {stop.activities.length > 0 && (
                    <div className="p-4 space-y-2">
                      {stop.activities.map((ta: any) => (
                        <div key={ta.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{ta.activity.name}</p>
                            {ta.startTime && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Clock className="w-3 h-3" /> {ta.startTime}
                                {ta.endTime ? ` - ${ta.endTime}` : ""}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {formatMoney(ta.actualCost ?? ta.activity.cost, ta.activity.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
