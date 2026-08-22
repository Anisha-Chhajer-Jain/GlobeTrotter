"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { dashboardApi, citiesApi, tripsApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, StatTile } from "@/components/ui/Misc";
import { formatMoney } from "@/lib/format";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ec4899", "#94a3b8"];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [topCities, setTopCities] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const isAdmin = !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) {
      setLoading(false);
      return;
    }
    Promise.all([dashboardApi.get(), citiesApi.search({ sortBy: "popularity", sortOrder: "desc", limit: 8 }), tripsApi.list({ limit: 100 })])
      .then(([dash, cities, trips]) => {
        setData(dash);
        setTopCities(cities.cities);
        const counts: Record<string, number> = {};
        for (const t of trips.trips) counts[t.status] = (counts[t.status] || 0) + 1;
        setStatusCounts(counts);
      })
      .finally(() => setLoading(false));
  }, [status, isAdmin]);

  if (status === "loading" || loading) return <LoadingSpinner label="Loading analytics..." />;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access required"
        description="This dashboard is restricted. Ask an administrator to add your email to NEXT_PUBLIC_ADMIN_EMAILS."
      />
    );
  }

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const categoryData = (data?.expenseByCategory || []).map((c: any) => ({ name: c.category, value: c.total }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" /> Admin Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Best-effort analytics aggregated from existing endpoints — no dedicated admin API exists yet.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total Trips" value={data.stats.totalTrips} tone="blue" />
        <StatTile label="Total Budget Tracked" value={formatMoney(data.stats.totalBudget, data.userCurrency)} tone="indigo" />
        <StatTile label="Total Spent" value={formatMoney(data.stats.totalSpent, data.userCurrency)} tone="amber" />
        <StatTile label="Cities Visited" value={data.stats.citiesVisited} tone="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Trips by Status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No trip data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Expense Spend by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No expense data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categoryData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatMoney(v, data.userCurrency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-3 text-sm">Top Cities by Popularity</h3>
        <div className="divide-y divide-gray-50">
          {topCities.map((city, i) => (
            <div key={city.id} className="flex items-center gap-3 py-2.5">
              <span className="w-6 text-sm font-bold text-gray-400">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {city.name}, {city.country}
                </p>
                <p className="text-xs text-gray-500">{city._count?.activities ?? 0} activities listed</p>
              </div>
              <span className="text-sm font-semibold text-blue-600">{city.popularity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
