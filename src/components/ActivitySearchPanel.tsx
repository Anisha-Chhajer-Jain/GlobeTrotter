"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { activitiesApi } from "@/lib/api-client";
import ActivityCard from "@/components/ActivityCard";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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

      {loading ? (
        <LoadingSpinner label="Searching activities..." />
      ) : activities.length === 0 ? (
        <EmptyState title="No activities found" description="Try a different search or filter." />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
