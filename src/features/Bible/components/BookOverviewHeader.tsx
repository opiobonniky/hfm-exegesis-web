// BookOverviewHeader — sticky back button + book name
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";

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
    <header className="shrink-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold truncate">{bookName} Overview</h1>
        </div>
      </div>
    </header>
  );
}
