// BookOverviewHeader — sticky back button + book name
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from '@/components/languages/hardcodedTranslate';

interface BookOverviewHeaderProps {
  bookName: string;
  onBack: () => void;
}

export default function BookOverviewHeader({
  bookName,
  onBack,
}: BookOverviewHeaderProps) {
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
          <p className="text-sm font-medium truncate">{bookName} · {tt("Overview")}</p>
        </div>
      </div>
    </header>
  );
}
