/**
 * DevotionList — renders the list of devotion items with selection support.
 */
import { DevotionListItem } from "./DevotionListItem";
import type { DailyDevotionItem } from "../types";

interface Props {
  devotions: DailyDevotionItem[];
  selectedIndex: number;
  isAdmin: boolean;
  onSelect: (index: number) => void;
  onEdit: (item: DailyDevotionItem) => void;
  onDelete: (item: DailyDevotionItem) => void;
}

export function DevotionList({
  devotions,
  selectedIndex,
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {devotions.map((item, idx) => (
        <DevotionListItem
          key={item.id}
          item={item}
          isSelected={selectedIndex === idx}
          onSelect={() => onSelect(idx)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
