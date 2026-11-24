// JournalEntryDetailHeader — sticky toolbar matching the consumer Book
// Overview, plus the moderation actions for the entry.
import { ArrowLeft, Globe, Lock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from '@/components/languages/hardcodedTranslate';

interface JournalEntryDetailHeaderProps {
  userId?: string;
  isPublished: boolean;
  onBack: () => void;
  onTogglePublication: () => void;
  onDelete: () => void;
}

export default function JournalEntryDetailHeader({
  userId,
  isPublished,
  onBack,
  onTogglePublication,
  onDelete,
}: JournalEntryDetailHeaderProps) {
  const { isRtl } = useLanguage();

  return (
    <header className="book-overview-toolbar shrink-0 z-30">
      <div className="book-overview-bar flex items-center gap-2 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onBack}
          aria-label={tt("Go back")}
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">
            {tt("Journal entry")}
            {userId ? ` · ${userId.slice(0, 8)}…` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePublication}
          className="gap-2 rounded-full"
        >
          {isPublished ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
          {isPublished ? tt("Make Private") : tt("Make Public")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="gap-2 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {tt("Delete")}
        </Button>
      </div>
    </header>
  );
}
