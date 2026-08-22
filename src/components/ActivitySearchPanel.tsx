"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { activitiesApi } from "@/lib/api-client";
import ActivityCard from "@/components/ActivityCard";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Input";

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
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          limit: 24,
        });
        setActivities(res.activities);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, type, cityId, sortBy]);

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
      </div>

      {loading ? (
        <LoadingSpinner label="Searching activities..." />
      ) : activities.length === 0 ? (
        <EmptyState title="No activities found" description="Try a different search or filter." />
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
    </div>
  );
}
