// DailyContentGrid — responsive grid wrapper for daily content cards
"use client";

import type { DailyItem } from "../types";
import { DailyContentCard } from "./DailyContentCard";

interface Props {
  items: DailyItem[];
  onView: (item: DailyItem) => void;
  onEdit: (item: DailyItem) => void;
  onDelete: (item: DailyItem) => void;
}

export function DailyContentGrid({ items, onView, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <DailyContentCard
          key={item.id}
          item={item}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
