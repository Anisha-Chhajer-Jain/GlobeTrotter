"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, BarChart3, Users, MapPin, Sparkles, LineChart as LineChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { adminApi, ApiError } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, StatTile, Badge } from "@/components/ui/Misc";
import Modal from "@/components/ui/Modal";
import { formatMoney, formatDate, formatDateRange } from "@/lib/format";
import { cn } from "@/lib/cn";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ec4899", "#94a3b8"];

const TABS = [
  { key: "users", label: "Manage Users", icon: Users },
  { key: "cities", label: "Popular Cities", icon: MapPin },
  { key: "activities", label: "Popular Activities", icon: Sparkles },
  { key: "trends", label: "User Trends and Analytics", icon: LineChartIcon },
] as const;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("users");
  const [selectedUser, setSelectedUser] = useState<{ user: any; trips: any[] } | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const looksLikeAdmin = !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") setLoading(false);
      return;
    }
    adminApi
      .getStats()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load admin stats"))
      .finally(() => setLoading(false));
  }, [status]);

  async function openUser(userId: string) {
    setLoadingUser(true);
    try {
      const res = await adminApi.getUser(userId);
      setSelectedUser(res);
    } catch {
      setError("Failed to load user details");
    } finally {
      setLoadingUser(false);
    }
  }

  if (status === "loading" || loading) return <LoadingSpinner label="Loading analytics..." />;

  if (!looksLikeAdmin || error) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access required"
        description={error || "This dashboard is restricted to admin accounts."}
      />
    );
  }

  if (!data) return null;

  const categoryData = data.expensesByCategory.map((c: any) => ({ name: c.category, value: c.total }));
  const statusData = data.tripsByStatus.map((s: any) => ({ name: s.status, value: s.count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-600" /> Admin Panel
        </h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide stats across every user and trip.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
              tab === t.key ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-4">
            Managing the users and their actions. Click a user to view all the trips made by them.
          </p>
          <div className="divide-y divide-gray-50">
            {data.recentUsers.map((u: any) => (
              <button
                key={u.id}
                onClick={() => openUser(u.id)}
                className="w-full flex items-center justify-between py-3 gap-2 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name || "—"}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-gray-700">{u._count.trips} trips</p>
                  <p className="text-xs text-gray-400">Joined {formatDate(u.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "cities" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-4">Popular cities where users are visiting based on overall trends.</p>
          <div className="divide-y divide-gray-50">
            {data.topCities.map((city: any, i: number) => (
              <div key={city.id} className="flex items-center gap-3 py-2.5">
                <span className="w-6 text-sm font-bold text-gray-400">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {city.name}, {city.country}
                  </p>
                  <p className="text-xs text-gray-500">
                    {city.activityCount} activities · added to {city.timesAddedToTrips} trip{city.timesAddedToTrips === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary-600">{city.popularity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activities" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-4">Popular activities users are doing based on overall trip data.</p>
          <div className="divide-y divide-gray-50">
            {data.topActivities.length === 0 ? (
              <EmptyState title="No activity usage yet" />
            ) : (
              data.topActivities.map((activity: any, i: number) => (
                <div key={activity.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-6 text-sm font-bold text-gray-400">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-500">
                      {activity.city?.name}, {activity.city?.country}
                    </p>
                  </div>
                  <Badge tone="gray">{activity.type}</Badge>
                  <span className="text-sm font-semibold text-primary-600 w-10 text-right">{activity.timesAddedToTrips}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "trends" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Total Users" value={data.totalUsers} tone="blue" />
            <StatTile label="New Users (30d)" value={data.newUsersLast30Days} tone="green" />
            <StatTile label="Total Trips" value={data.totalTrips} tone="indigo" />
            <StatTile
              label="Total Expenses Logged"
              value={data.expensesByCategory.reduce((sum: number, c: any) => sum + c.count, 0)}
              tone="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Trips by Status (all users)</h3>
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
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Expense Spend by Category (all users)</h3>
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
                    <Tooltip formatter={(v: number) => formatMoney(v, "USD")} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Newest Trips</h3>
            <div className="divide-y divide-gray-50">
              {data.recentTrips.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between py-2.5 gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                    <p className="text-xs text-gray-500 truncate">{t.owner?.name || t.owner?.email}</p>
                  </div>
                  <Badge tone="gray">{t.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal open={!!selectedUser || loadingUser} onClose={() => setSelectedUser(null)} title={selectedUser?.user.name || "User"} size="md">
        {loadingUser ? (
          <LoadingSpinner label="Loading user..." />
        ) : selectedUser ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">{selectedUser.user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(selectedUser.user.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-2">Trips ({selectedUser.trips.length})</h4>
              {selectedUser.trips.length === 0 ? (
                <EmptyState title="No trips yet" />
              ) : (
                <div className="space-y-2">
                  {selectedUser.trips.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                        <p className="text-xs text-gray-500">{formatDateRange(t.startDate, t.endDate)}</p>
                      </div>
                      <Badge tone="gray">{t.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
