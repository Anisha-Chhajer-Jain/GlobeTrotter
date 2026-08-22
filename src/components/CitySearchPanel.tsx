"use client";

import { useEffect, useState } from "react";
import { Search, Globe2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { citiesApi, liveCitiesApi, ApiError } from "@/lib/api-client";
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
  const [country, setCountry] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [groupBy, setGroupBy] = useState<"" | "country">("");
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [worldwide, setWorldwide] = useState(false);
  const [liveCities, setLiveCities] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await citiesApi.search({ query, country: country || undefined, sortBy, sortOrder: "desc", page: 1, limit: PAGE_SIZE });
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
  }, [query, country, sortBy]);

  useEffect(() => {
    if (!worldwide || !query.trim()) {
      setLiveCities([]);
      return;
    }
    const t = setTimeout(async () => {
      setLiveLoading(true);
      try {
        const res = await liveCitiesApi.search(query);
        // Skip suggesting a live city that's obviously already in the local list.
        const localNames = new Set(cities.map((c) => `${c.name.toLowerCase()}-${c.country.toLowerCase()}`));
        setLiveCities(res.cities.filter((c) => !localNames.has(`${c.name.toLowerCase()}-${c.country.toLowerCase()}`)));
      } catch (err) {
        setLiveCities([]);
        if (err instanceof ApiError && err.status === 503) {
          toast.error("Worldwide search isn't configured (missing API key)");
          setWorldwide(false);
        }
      } finally {
        setLiveLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldwide, query]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await citiesApi.search({ query, country: country || undefined, sortBy, sortOrder: "desc", page: nextPage, limit: PAGE_SIZE });
      setCities((prev) => [...prev, ...res.cities]);
      setPage(nextPage);
      setHasMore(nextPage < res.pagination.pages);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleAddLiveCity(liveCity: any) {
    if (!onAdd) return;
    setImportingId(liveCity.geoDbId);
    try {
      const { city } = await liveCitiesApi.import(liveCity);
      onAdd(city);
    } catch {
      toast.error("Failed to import city");
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search cities or countries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          placeholder="Filter by country..."
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="sm:w-44"
        />
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

      <button
        onClick={() => setWorldwide((v) => !v)}
        className={`flex items-center gap-1.5 text-xs font-medium mb-5 px-2.5 py-1 rounded-full ${
          worldwide ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-500"
        }`}
      >
        <Globe2 className="w-3.5 h-3.5" /> Search worldwide
      </button>

      {loading ? (
        <LoadingSpinner label="Searching cities..." />
      ) : cities.length === 0 && !worldwide ? (
        <EmptyState title="No cities found" description="Try a different search term, or enable worldwide search." />
      ) : (
        <>
          {cities.length > 0 &&
            (groupBy === "country" ? (
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
            ))}
          {hasMore && (
            <div className="flex justify-center pt-5">
              <Button variant="outline" loading={loadingMore} onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}

          {worldwide && query.trim() && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-primary-600" /> More cities worldwide
              </h3>
              {liveLoading ? (
                <LoadingSpinner label="Searching worldwide..." />
              ) : liveCities.length === 0 ? (
                <p className="text-sm text-gray-400">No additional worldwide matches.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveCities.map((city) => (
                    <div key={city.geoDbId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                      <h4 className="font-bold text-gray-900">{city.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {city.region ? `${city.region}, ` : ""}
                        {city.country}
                      </p>
                      {city.population && (
                        <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Users className="w-3 h-3" /> {city.population.toLocaleString()}
                        </p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => handleAddLiveCity(city)}
                        loading={importingId === city.geoDbId}
                      >
                        Add to trip
                      </Button>
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
