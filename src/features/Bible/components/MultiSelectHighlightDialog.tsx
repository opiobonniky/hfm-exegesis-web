"use client";

import { Loader2 } from "lucide-react";
import {
  VERSE_HIGHLIGHT_COLORS,
  VERSE_HIGHLIGHT_COLOR_GROUPS,
} from "../constants";

interface MultiSelectHighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Number of verses the color will be applied to. */
  count: number;
  saving: boolean;
  /** Apply a color to all selected verses. */
  onPick: (colorId: number) => void;
  /** Remove highlights from all selected verses. */
  onClear: () => void;
  labels?: { title?: string; subtitle?: string; remove?: string; cancel?: string };
}

export default function MultiSelectHighlightDialog({
  open,
  onOpenChange,
  count,
  saving,
  onPick,
  onClear,
  labels,
}: MultiSelectHighlightDialogProps) {
  if (!open) return null;

  const title = labels?.title ?? "Highlight verses";
  const subtitle =
    labels?.subtitle ?? `Choose a color for ${count} selected verse${count === 1 ? "" : "s"}`;
  const removeLabel = labels?.remove ?? "Remove highlight";
  const cancelLabel = labels?.cancel ?? "Cancel";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
      onClick={() => !saving && onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-t-2xl border border-border bg-popover p-4 shadow-2xl sm:rounded-2xl animate-in fade-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="font-[family-name:var(--font-heading)] text-sm font-semibold text-foreground">
              {title}
            </p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={cancelLabel}
          >
            <Loader2 className={saving ? "h-4 w-4 animate-spin" : "hidden"} />
            {!saving && <span aria-hidden="true">✕</span>}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {VERSE_HIGHLIGHT_COLOR_GROUPS.map((group) => {
            const colors = group.ids
              .map((id) => VERSE_HIGHLIGHT_COLORS.find((c) => c.id === id))
              .filter(Boolean) as typeof VERSE_HIGHLIGHT_COLORS;
            return (
              <div key={group.label} className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      disabled={saving}
                      onClick={() => onPick(c.id)}
                      className="h-7 w-7 rounded-full border border-black/10 transition-transform duration-150 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                      aria-label={`${c.name} highlight`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
          <button
            type="button"
            onClick={onClear}
            disabled={saving}
            className="flex-1 rounded-lg border border-dashed border-muted-foreground/40 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {removeLabel}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="flex-1 rounded-lg border border-border bg-background py-1.5 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
