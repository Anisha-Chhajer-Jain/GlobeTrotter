"use client";

import { useEffect, useState } from "react";
import { Search, Compass, Star, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { activitiesApi, liveActivitiesApi, ApiError } from "@/lib/api-client";
import ActivityCard from "@/components/ActivityCard";
import { LoadingSpinner, EmptyState, Badge } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import { formatDuration } from "@/lib/budget";

const ACTIVITY_TYPES = [
  "SIGHTSEEING",
  "FOOD",
  "TRANSPORT",
  "ACCOMMODATION",
  "ENTERTAINMENT",
  "SHOPPING",
  "ADVENTURE",
  "CULTURE",
  "NATURE",
  "OTHER",
];

const PAGE_SIZE = 24;

export default function ActivitySearchPanel({
  cityId,
  onAdd,
  addedActivityIds = [],
  addingActivityId,
}: {
  cityId?: string;
  onAdd?: (activity: any) => void;
  addedActivityIds?: string[];
  addingActivityId?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [groupBy, setGroupBy] = useState<"" | "type">("");
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [importingXid, setImportingXid] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await activitiesApi.search({
          query,
          type: type || undefined,
          cityId,
          sortBy,
          sortOrder: "desc",
          page: 1,
          limit: PAGE_SIZE,
        });
        setActivities(res.activities);
        setPage(1);
        setHasMore(1 < res.pagination.pages);
      } catch {
        setActivities([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, type, cityId, sortBy]);

  useEffect(() => {
    if (!discoverOpen || !cityId) return;
    setLiveLoading(true);
    liveActivitiesApi
      .search(cityId, query || undefined)
      .then((res) => setLiveActivities(res.activities))
      .catch((err) => {
        setLiveActivities([]);
        if (err instanceof ApiError && err.status === 503) {
          toast.error("Discovery isn't configured (missing API key)");
          setDiscoverOpen(false);
        }
      })
      .finally(() => setLiveLoading(false));
  }, [discoverOpen, cityId, query]);

  async function handleImportActivity(place: any) {
    if (!onAdd || !cityId) return;
    setImportingXid(place.xid);
    try {
      const { activity } = await liveActivitiesApi.import({
        cityId,
        xid: place.xid,
        name: place.name,
        description: place.description,
        type: place.type,
        rating: place.rating,
        latitude: place.latitude,
        longitude: place.longitude,
        imageUrl: place.imageUrl,
        address: place.address,
        costEstimate: place.costEstimate,
        durationMinutes: place.durationMinutes,
      });
      onAdd(activity);
      setLiveActivities((prev) => prev.filter((p) => p.xid !== place.xid));
    } catch {
      toast.error("Failed to import activity");
    } finally {
      setImportingXid(null);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await activitiesApi.search({
        query,
        type: type || undefined,
        cityId,
        sortBy,
        sortOrder: "desc",
        page: nextPage,
        limit: PAGE_SIZE,
      });
      setActivities((prev) => [...prev, ...res.activities]);
      setPage(nextPage);
      setHasMore(nextPage < res.pagination.pages);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:w-44">
          <option value="">All types</option>
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sm:w-44">
          <option value="popularity">Most popular</option>
          <option value="rating">Top rated</option>
          <option value="cost">Cost</option>
          <option value="duration">Duration</option>
        </Select>
        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as "" | "type")} className="sm:w-40">
          <option value="">No grouping</option>
          <option value="type">Group by type</option>
        </Select>
      </div>

      {cityId && (
        <button
          onClick={() => setDiscoverOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium mb-5 px-2.5 py-1 rounded-full ${
            discoverOpen ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          <Compass className="w-3.5 h-3.5" /> Discover nearby
        </button>
      )}

      {loading ? (
        <LoadingSpinner label="Searching activities..." />
      ) : activities.length === 0 && !(discoverOpen && cityId) ? (
        <EmptyState title="No activities found" description="Try a different search or filter." />
      ) : (
        <>
          {activities.length === 0 && <EmptyState title="No local activities found" description="Check discovery results below." />}
          {groupBy === "type" ? (
            <div className="space-y-6">
              {Object.entries(
                activities.reduce((acc: Record<string, any[]>, activity) => {
                  (acc[activity.type] ||= []).push(activity);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([activityType, group]) => (
                  <div key={activityType}>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">{activityType}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onAdd={onAdd}
                          added={addedActivityIds.includes(activity.id)}
                          adding={addingActivityId === activity.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onAdd={onAdd}
                  added={addedActivityIds.includes(activity.id)}
                  adding={addingActivityId === activity.id}
                />
              ))}
            </div>
          )}
          {hasMore && (
            <div className="flex justify-center pt-5">
              <Button variant="outline" loading={loadingMore} onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}

          {discoverOpen && cityId && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" /> Discovered nearby
              </h3>
              {liveLoading ? (
                <LoadingSpinner label="Discovering nearby places..." />
              ) : liveActivities.length === 0 ? (
                <p className="text-sm text-gray-400">No additional places discovered nearby.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveActivities.map((place) => (
                    <div key={place.xid} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {place.imageUrl && <img src={place.imageUrl} alt="" className="w-full h-28 object-cover" />}
                      <div className="p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-900 flex-1 truncate">{place.name}</h4>
                          <Badge tone="gray">{place.type}</Badge>
                        </div>
                        {place.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{place.description}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {place.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {formatDuration(place.durationMinutes)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                          <span className="text-sm font-semibold text-gray-900">
                            {place.costEstimate ? formatMoney(place.costEstimate, "USD") : "Free"}
                          </span>
                          <Button size="sm" variant="outline" loading={importingXid === place.xid} onClick={() => handleImportActivity(place)}>
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
