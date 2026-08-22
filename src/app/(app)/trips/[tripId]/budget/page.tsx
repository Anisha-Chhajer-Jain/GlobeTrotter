"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { expensesApi, tripsApi } from "@/lib/api-client";
import { LoadingSpinner, EmptyState, StatTile } from "@/components/ui/Misc";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { formatMoney, formatDate, formatDayLabel, tripDurationDays } from "@/lib/format";

const CATEGORIES = ["TRANSPORT", "ACCOMMODATION", "FOOD", "ACTIVITIES", "SHOPPING", "MISCELLANEOUS"];
const COLORS = ["#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ec4899", "#94a3b8"];

const emptyForm = { title: "", description: "", amount: "", category: "MISCELLANEOUS", date: "" };

export default function TripBudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  async function load() {
    setLoading(true);
    try {
      const [expensesRes, tripRes] = await Promise.all([expensesApi.list(tripId, { limit: 100 }), tripsApi.get(tripId)]);
      setExpenses(expensesRes.expenses);
      setBudget(expensesRes.budget);
      setTrip(tripRes.trip);
    } catch {
      toast.error("Failed to load budget");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(exp: any) {
    setEditing(exp);
    setForm({
      title: exp.title,
      description: exp.description || "",
      amount: String(exp.amount),
      category: exp.category,
      date: exp.date ? exp.date.split("T")[0] : "",
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        amount: Number(form.amount),
        category: form.category,
        date: form.date || undefined,
      };
      if (editing) {
        await expensesApi.update(editing.id, payload);
        toast.success("Expense updated");
      } else {
        await expensesApi.create(tripId, payload);
        toast.success("Expense added");
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await expensesApi.remove(deleteTarget.id);
      toast.success("Expense deleted");
      load();
    } catch {
      toast.error("Failed to delete expense");
    } finally {
      setDeleteTarget(null);
    }
  }

  if (loading) return <LoadingSpinner label="Loading budget..." />;
  if (!budget) return <EmptyState title="Trip not found" />;

  const categoryData = Object.entries(budget.byCategory).map(([name, value]) => ({ name, value: Number(value) }));
  const cityData = Object.entries(budget.byCity).map(([name, value]) => ({ name, value: Number(value) }));
  const isOverBudget = budget.remaining < 0;

  const dayEntries = Object.entries(budget.byDay as Record<string, number>).filter(([day]) => day !== "unscheduled");
  const tripDays = trip ? tripDurationDays(trip.startDate, trip.endDate) : 0;
  const totalActivity = budget.totalSpent + budget.totalEstimated;
  const avgPerDay = tripDays > 0 ? totalActivity / tripDays : dayEntries.length > 0 ? totalActivity / dayEntries.length : 0;
  const dailyBudgetThreshold = tripDays > 0 && budget.totalBudget > 0 ? budget.totalBudget / tripDays : null;
  const overBudgetDays = dailyBudgetThreshold
    ? dayEntries.filter(([, amount]) => Number(amount) > dailyBudgetThreshold).sort(([a], [b]) => a.localeCompare(b))
    : [];
  const dayChartData = dayEntries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, value]) => ({ name: formatDate(day), value: Number(value) }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/trips/${tripId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to itinerary
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Budget & Cost Breakdown</h1>
      </div>

      {isOverBudget && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          You&apos;re over budget by {formatMoney(Math.abs(budget.remaining), budget.currency)}.
        </div>
      )}

      {overBudgetDays.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-xl px-4 py-3 text-sm">
          <div className="flex items-center gap-3 font-semibold mb-1.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {overBudgetDays.length} day{overBudgetDays.length === 1 ? "" : "s"} over your average daily budget
          </div>
          <ul className="pl-8 space-y-0.5 text-amber-700">
            {overBudgetDays.map(([day, amount]) => (
              <li key={day}>
                {formatDayLabel(day)} — {formatMoney(amount, budget.currency)}
                {dailyBudgetThreshold ? ` (budget: ${formatMoney(dailyBudgetThreshold, budget.currency)})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile label="Total Budget" value={formatMoney(budget.totalBudget, budget.currency)} tone="blue" />
        <StatTile label="Spent" value={formatMoney(budget.totalSpent, budget.currency)} tone="amber" />
        <StatTile label="Est. Activities" value={formatMoney(budget.totalEstimated, budget.currency)} tone="indigo" />
        <StatTile label="Avg / Day" value={formatMoney(avgPerDay, budget.currency)} tone="indigo" />
        <StatTile label="Remaining" value={formatMoney(budget.remaining, budget.currency)} tone={isOverBudget ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Spend by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No expenses logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatMoney(v, budget.currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
          {categoryData.length > 0 && (
            <div className="mt-4 space-y-2.5">
              {categoryData
                .slice()
                .sort((a, b) => b.value - a.value)
                .map((c, i) => {
                  const pct = budget.totalSpent > 0 ? Math.round((c.value / budget.totalSpent) * 100) : 0;
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{c.name}</span>
                        <span className="text-gray-500">
                          {formatMoney(c.value, budget.currency)} · {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Estimated Cost by City</h3>
          {cityData.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">No activities with cost yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatMoney(v, budget.currency)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {dayChartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Spend by Day</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dayChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatMoney(v, budget.currency)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {dayChartData.map((d, i) => (
                  <Cell key={i} fill={dailyBudgetThreshold && d.value > dailyBudgetThreshold ? "#ef4444" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Expenses</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" /> Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses yet" description="Log expenses to track your actual spending." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{exp.title}</p>
                <p className="text-xs text-gray-500">
                  {exp.category} · {formatDate(exp.date)}
                </p>
              </div>
              <span className="font-semibold text-gray-900 text-sm">{formatMoney(exp.amount, exp.currency)}</span>
              <button onClick={() => openEdit(exp)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleteTarget(exp)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Expense" : "Add Expense"} size="sm">
        <div className="space-y-4">
          <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            />
            <Select label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          <Textarea
            label="Notes"
            rows={2}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave} disabled={!form.title || !form.amount}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete expense"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
