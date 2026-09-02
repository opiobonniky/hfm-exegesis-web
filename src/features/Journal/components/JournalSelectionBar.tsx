import { CheckSquare, Download, Square } from "lucide-react";

interface JournalSelectionBarProps {
  selectedCount: number;
  entryCount: number;
  onToggleAll: () => void;
  onClear: () => void;
  onExport: () => void;
}

export function JournalSelectionBar({ selectedCount, entryCount, onToggleAll, onClear, onExport }: JournalSelectionBarProps) {
  const allSelected = selectedCount === entryCount;

  return (
    <div className="sticky top-14 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 mb-4 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleAll} className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors">
            {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <div className="text-xs text-muted-foreground/70">{selectedCount} of {entryCount} selected</div>
        </div>
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors px-3 py-1.5 rounded-xl border border-border hover:border-foreground/30">Clear</button>
            <button onClick={onExport} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-foreground hover:bg-amber-400 transition-all">
              <Download className="w-3.5 h-3.5" />Export Selected ({selectedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
