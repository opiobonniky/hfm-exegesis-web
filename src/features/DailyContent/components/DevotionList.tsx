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
    <div className="space-y-3">
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
