"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { citiesApi } from "@/lib/api-client";
import CityCard from "@/components/CityCard";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const PAGE_SIZE = 24;

export default function CitySearchPanel({
  onAdd,
  addedCityIds = [],
  addingCityId,
}: {
  onAdd?: (city: any) => void;
  addedCityIds?: string[];
  addingCityId?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [groupBy, setGroupBy] = useState<"" | "country">("");
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await citiesApi.search({ query, sortBy, sortOrder: "desc", page: 1, limit: PAGE_SIZE });
        setCities(res.cities);
        setPage(1);
        setHasMore(1 < res.pagination.pages);
      } catch {
        setCities([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, sortBy]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await citiesApi.search({ query, sortBy, sortOrder: "desc", page: nextPage, limit: PAGE_SIZE });
      setCities((prev) => [...prev, ...res.cities]);
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
            placeholder="Search cities or countries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as "" | "country")} className="sm:w-40">
          <option value="">No grouping</option>
          <option value="country">Group by country</option>
        </Select>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sm:w-48">
          <option value="popularity">Most popular</option>
          <option value="name">Name (A-Z)</option>
          <option value="costIndex">Cost index</option>
        </Select>
      </div>

      {loading ? (
        <LoadingSpinner label="Searching cities..." />
      ) : cities.length === 0 ? (
        <EmptyState title="No cities found" description="Try a different search term." />
      ) : (
        <>
          {groupBy === "country" ? (
            <div className="space-y-6">
              {Object.entries(
                cities.reduce((acc: Record<string, any[]>, city) => {
                  (acc[city.country] ||= []).push(city);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([country, group]) => (
                  <div key={country}>
                    <h3 className="text-sm font-bold text-gray-700 mb-3">{country}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.map((city) => (
                        <CityCard
                          key={city.id}
                          city={city}
                          onAdd={onAdd}
                          added={addedCityIds.includes(city.id)}
                          adding={addingCityId === city.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onAdd={onAdd}
                  added={addedCityIds.includes(city.id)}
                  adding={addingCityId === city.id}
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
