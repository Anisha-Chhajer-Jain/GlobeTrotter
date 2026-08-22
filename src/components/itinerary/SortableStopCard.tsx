"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { GripVertical, MapPin, Trash2, Plus, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatDate, dateInputValue } from "@/lib/format";
import SortableActivityRow from "./SortableActivityRow";

export default function SortableStopCard({
  stop,
  index,
  onDeleteStop,
  onUpdateStopDates,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onReorderActivities,
  onOpenBudget,
}: {
  stop: any;
  index: number;
  onDeleteStop: (stop: any) => void;
  onUpdateStopDates: (stop: any, arrivalDate: string, departureDate: string) => void;
  onAddActivity: (stop: any) => void;
  onEditActivity: (stop: any, ta: any) => void;
  onDeleteActivity: (stop: any, ta: any) => void;
  onReorderActivities: (stop: any, activityIds: string[]) => void;
  onOpenBudget: (stop: any) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  function handleActivityDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = stop.activities.map((a: any) => a.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    onReorderActivities(stop, arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </div>
        {stop.city?.imageUrl && (
          <img src={stop.city.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0 hidden sm:block" />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" /> {stop.city?.name}, {stop.city?.country}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Input
              type="date"
              value={dateInputValue(stop.arrivalDate)}
              onChange={(e) => onUpdateStopDates(stop, e.target.value, dateInputValue(stop.departureDate))}
              className="!py-1 !px-2 text-xs w-36"
            />
            <span className="text-xs text-gray-400">to</span>
            <Input
              type="date"
              value={dateInputValue(stop.departureDate)}
              onChange={(e) => onUpdateStopDates(stop, dateInputValue(stop.arrivalDate), e.target.value)}
              className="!py-1 !px-2 text-xs w-36"
            />
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onDeleteStop(stop)}
          className="p-2 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {stop.activities.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleActivityDragEnd}>
              <SortableContext items={stop.activities.map((a: any) => a.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {stop.activities.map((ta: any) => (
                    <SortableActivityRow
                      key={ta.id}
                      tripActivity={ta}
                      onEdit={(a) => onEditActivity(stop, a)}
                      onDelete={(a) => onDeleteActivity(stop, a)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <div className="flex gap-2 mt-1">
            <Button variant="outline" size="sm" onClick={() => onAddActivity(stop)} className="flex-1">
              <Plus className="w-3.5 h-3.5" /> Add Activity
            </Button>
            <Button variant="outline" size="sm" onClick={() => onOpenBudget(stop)} className="flex-1">
              <Wallet className="w-3.5 h-3.5" /> Budget of this section
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
