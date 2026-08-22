"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { citiesApi } from "@/lib/api-client";
import CityCard from "@/components/CityCard";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import { Input, Select } from "@/components/ui/Input";

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
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await citiesApi.search({ query, sortBy, sortOrder: "desc", limit: 24 });
        setCities(res.cities);
      } catch {
        setCities([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, sortBy]);

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
    </div>
  );
}
