import { Sun } from "lucide-react";

interface Props {
  isFiltered: boolean;
  onClearFilter: () => void;
  onRefresh: () => void;
}

export default function DailyVerseEmptyState({ isFiltered, onClearFilter, onRefresh }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Sun className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No verses found</h3>
      <p className="text-sm text-muted-foreground mb-5">
        {isFiltered ? "No verses match the selected date range." : "No daily verses have been added yet."}
      </p>
      <div className="flex gap-2">
        {isFiltered && (
          <button onClick={onClearFilter} className="text-sm text-primary underline">Clear Filter</button>
        )}
        <button onClick={onRefresh} className="text-sm text-primary underline">Refresh</button>
      </div>
    </div>
  );
}
