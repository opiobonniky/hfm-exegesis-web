import { useEffect, useRef } from "react";
import { CheckCircle2, Clock, Download, Globe, Lock, Share2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { JournalPageEntry } from "../hooks/useJournalPageFull";
import { tt } from "@/components/languages/hardcodedTranslate";
import { displayDate } from "@/services/numberLocale/format";

const moods: Record<string, string> = { happy: "😊", grateful: "🙏", peaceful: "🕊️", thoughtful: "🤔", motivated: "💪", hopeful: "🌟", challenged: "🧗", blessed: "✨" };
interface Props { entry: JournalPageEntry; selectionMode?: boolean; selected?: boolean; onSelect?: (id: number) => void; onBeginSelection?: (id: number) => void; onView: (id: number) => void; onDelete?: (entry: JournalPageEntry) => void; onFavorite?: (id: number) => void; onAction?: (kind: "pdf" | "share", entry: JournalPageEntry) => void }
export function JournalEntryCard({ entry, selectionMode = false, selected = false, onSelect, onBeginSelection, onView, onDelete, onFavorite, onAction }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout>>(); const held = useRef(false); const origin = useRef({ x: 0, y: 0 });
  const cancelHold = () => { if (timer.current) clearTimeout(timer.current); timer.current = undefined; };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const begin = () => { held.current = true; onBeginSelection?.(entry.id); };
  const date = entry.createdOn || entry.updatedOn;
  return <article role="button" tabIndex={0} aria-label={`${entry.title || tt("Untitled Entry")}${selectionMode ? `, ${selected ? tt("selected") : tt("not selected")}` : ""}`} aria-pressed={selectionMode ? selected : undefined}
    className={cn("group rounded-2xl border bg-card p-5 text-start shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border")}
    onPointerDown={e => { if (e.button !== 0 || (e.target as HTMLElement).closest("button,a,input")) return; cancelHold(); held.current = false; origin.current = { x: e.clientX, y: e.clientY }; timer.current = setTimeout(begin, 450); }}
    onPointerMove={e => { if (Math.hypot(e.clientX - origin.current.x, e.clientY - origin.current.y) > 10) cancelHold(); }}
    onPointerUp={cancelHold} onPointerCancel={cancelHold} onPointerLeave={cancelHold}
    onContextMenu={e => { if (!(e.target as HTMLElement).closest("button,a")) { e.preventDefault(); cancelHold(); begin(); } }}
    onClick={e => { if ((e.target as HTMLElement).closest("button,a")) return; if (held.current) { held.current = false; return; } selectionMode ? onSelect?.(entry.id) : onView(entry.id); }}
    onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === " ") { e.preventDefault(); selectionMode ? onSelect?.(entry.id) : onBeginSelection?.(entry.id); } else if (e.key === "Enter") { e.preventDefault(); selectionMode ? onSelect?.(entry.id) : onView(entry.id); } }}>
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {selected && <CheckCircle2 className="size-4 text-primary" />}
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">{tt(entry.category || "General")}</span>
      {entry.mood && <span>{moods[entry.mood] || entry.mood}</span>}
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">{entry.isPublished ? <Globe className="size-3" /> : <Lock className="size-3" />}{tt(entry.isPublished ? "Public" : "Private")}</span>
    </div>
    <h2 className="mb-2 line-clamp-2 text-base font-semibold">{entry.title || tt("Untitled Entry")}</h2>
    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
    {entry.bookName && <p className="mt-3 text-xs font-medium text-primary">{entry.bookName} {entry.chapter}{entry.verseNumber != null ? `:${entry.verseNumber}` : ""}</p>}
    <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" />{date && !Number.isNaN(Date.parse(date)) ? displayDate(date, undefined, { month: "short", day: "numeric" }) : ""}</span>
      {!selectionMode && <div className="flex items-center gap-1">
        {onAction && <><Button size="sm" variant="ghost" className="gap-1 text-red-600 dark:text-red-400" aria-label={tt("Download PDF")} onClick={() => onAction("pdf", entry)}><Download className="size-4" />PDF</Button><Button size="icon" variant="ghost" className="size-9 text-primary" aria-label={tt("Share entry")} onClick={() => onAction("share", entry)}><Share2 className="size-4" /></Button></>}
        {onFavorite && <Button size="icon" variant="ghost" className="size-9" aria-label={tt("Toggle favorite")} aria-pressed={!!entry.isFavorite} onClick={() => onFavorite(entry.id)}><Star className={cn("size-4", entry.isFavorite && "fill-amber-500 text-amber-500")} /></Button>}
        {onDelete && <Button size="icon" variant="ghost" className="size-9 text-destructive" aria-label={tt("Delete entry")} onClick={() => onDelete(entry)}><Trash2 className="size-4" /></Button>}
      </div>}
    </footer>
  </article>;
}
