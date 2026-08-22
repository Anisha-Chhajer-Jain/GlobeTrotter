"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock, Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/Misc";

export default function SortableActivityRow({
  tripActivity,
  onEdit,
  onDelete,
}: {
  tripActivity: any;
  onEdit: (ta: any) => void;
  onDelete: (ta: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tripActivity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const activity = tripActivity.activity;
  const cost = tripActivity.actualCost ?? activity.cost;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
    >
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">{activity.name}</span>
          <Badge tone="gray">{activity.type}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
          {tripActivity.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {tripActivity.startTime}
              {tripActivity.endTime ? ` - ${tripActivity.endTime}` : ""}
            </span>
          )}
          <span className="font-medium text-gray-700">{Number(cost) === 0 ? "Free" : formatMoney(cost, activity.currency)}</span>
        </div>
      </div>
      <button onClick={() => onEdit(tripActivity)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-600 shrink-0">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onDelete(tripActivity)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
