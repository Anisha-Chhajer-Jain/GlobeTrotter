"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { LoadingSpinner, EmptyState } from "@/components/ui/Misc";
import { expensesApi } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";

const CATEGORIES = ["TRANSPORT", "ACCOMMODATION", "FOOD", "ACTIVITIES", "SHOPPING", "MISCELLANEOUS"];

export default function StopBudgetModal({
  open,
  tripId,
  stop,
  onClose,
}: {
  open: boolean;
  tripId: string;
  stop: any;
  onClose: () => void;
}) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", amount: "", category: "MISCELLANEOUS" });
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!stop) return;
    setLoading(true);
    try {
      const res = await expensesApi.list(tripId, { tripStopId: stop.id, limit: 50 });
      setExpenses(res.expenses);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stop?.id]);

  if (!stop) return null;

  const activityCost = stop.activities.reduce(
    (sum: number, ta: any) => sum + Number(ta.actualCost ?? ta.activity.cost ?? 0),
    0
  );
  const expenseCost = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  async function handleAdd() {
    setSaving(true);
    try {
      await expensesApi.create(tripId, {
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        tripStopId: stop.id,
      });
      setForm({ title: "", amount: "", category: "MISCELLANEOUS" });
      toast.success("Expense added");
      load();
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(expenseId: string) {
    try {
      await expensesApi.remove(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch {
      toast.error("Failed to remove expense");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Budget — ${stop.city?.name}`} size="md">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Activity costs</p>
          <p className="font-bold text-gray-900">{formatMoney(activityCost, stop.city?.currency || "USD")}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Manual expenses</p>
          <p className="font-bold text-gray-900">{formatMoney(expenseCost, "USD")}</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading expenses..." />
      ) : expenses.length === 0 ? (
        <EmptyState title="No expenses logged for this stop yet" />
      ) : (
        <div className="space-y-2 mb-4">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{exp.title}</p>
                <p className="text-xs text-gray-500">{exp.category}</p>
              </div>
              <span className="text-sm font-medium text-gray-700">{formatMoney(exp.amount, exp.currency)}</span>
              <button onClick={() => handleRemove(exp.id)} className="p-1 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Expense title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="flex-1"
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          className="sm:w-28"
        />
        <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="sm:w-40">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Button onClick={handleAdd} loading={saving} disabled={!form.title || !form.amount}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </Modal>
  );
}
