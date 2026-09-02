import { ArrowLeft, CheckCircle2, Copy, Download, Loader2, MoreHorizontal, Pencil, Share2, Star, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface JournalDetailTopBarProps {
  isOwner: boolean;
  isFavorite: boolean;
  copied: boolean;
  exporting: boolean;
  updatingFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onExportPdf: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function JournalDetailTopBar(props: JournalDetailTopBarProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/60 dark:border-stone-800/60 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-md">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-12">
        <button onClick={props.onBack} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />Journal
        </button>
        <div className="flex items-center gap-0.5">
          <button onClick={props.onToggleFavorite} disabled={props.updatingFavorite} aria-label="Toggle favorite" aria-pressed={props.isFavorite} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors disabled:opacity-50">
            {props.updatingFavorite ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/70" /> : <Star className={cn("w-3.5 h-3.5", props.isFavorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground/70")} />}
          </button>
          <button onClick={props.onShare} aria-label="Share entry" className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><Share2 className="w-3.5 h-3.5 text-muted-foreground/70" /></button>
          <button onClick={props.onExportPdf} disabled={props.exporting} aria-label="Export PDF" className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors">
            {props.exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/70" /> : <Download className="w-3.5 h-3.5 text-muted-foreground/70" />}
          </button>
          <button onClick={props.onCopy} aria-label="Copy entry" className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors">
            {props.copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground/70" />}
          </button>
          {props.isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button aria-label="Entry actions" className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/70" /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border dark:border-stone-800">
                <DropdownMenuItem onClick={props.onEdit} className="text-xs"><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={props.onDelete} className="text-xs text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
