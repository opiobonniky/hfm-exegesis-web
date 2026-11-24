// VerseExplanationDetailHeader — sticky back button + reference, matching the
// consumer Book Overview toolbar.
import { ArrowLeft, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from '@/components/languages/hardcodedTranslate';

interface VerseExplanationDetailHeaderProps {
  reference: string;
  onBack: () => void;
  onEdit: () => void;
}

export default function VerseExplanationDetailHeader({
  reference,
  onBack,
  onEdit,
}: VerseExplanationDetailHeaderProps) {
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
            {reference} · {tt("Verse Explanation")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="gap-2 rounded-full"
        >
          <Edit2 className="h-3.5 w-3.5" />
          {tt("Edit")}
        </Button>
      </div>
    </header>
  );
}
