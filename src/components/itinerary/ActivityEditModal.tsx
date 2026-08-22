"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { dateInputValue } from "@/lib/format";

export default function ActivityEditModal({
  open,
  tripActivity,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  tripActivity: any;
  onClose: () => void;
  onSave: (data: any) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({ scheduledDate: "", startTime: "", endTime: "", actualCost: "", notes: "" });

  useEffect(() => {
    if (tripActivity) {
      setForm({
        scheduledDate: dateInputValue(tripActivity.scheduledDate),
        startTime: tripActivity.startTime || "",
        endTime: tripActivity.endTime || "",
        actualCost: tripActivity.actualCost != null ? String(tripActivity.actualCost) : "",
        notes: tripActivity.notes || "",
      });
    }
  }, [tripActivity]);

  if (!tripActivity) return null;

  return (
    <Modal open={open} onClose={onClose} title={tripActivity.activity?.name || "Edit Activity"} size="sm">
      <div className="space-y-4">
        <Input
          label="Date"
          type="date"
          value={form.scheduledDate}
          onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          />
          <Input
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          />
        </div>
        <Input
          label="Actual cost (optional)"
          type="number"
          min="0"
          step="0.01"
          placeholder={String(tripActivity.activity?.cost ?? 0)}
          value={form.actualCost}
          onChange={(e) => setForm((f) => ({ ...f, actualCost: e.target.value }))}
        />
        <Textarea
          label="Notes"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={() =>
              onSave({
                scheduledDate: form.scheduledDate || null,
                startTime: form.startTime || null,
                endTime: form.endTime || null,
                actualCost: form.actualCost ? Number(form.actualCost) : null,
                notes: form.notes || null,
              })
            }
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
