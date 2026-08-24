import { ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/languages/languageProvider";
import { useUserDailyVerse } from "../hooks";
import { VerseLoadingSkeleton, VerseEmptyState } from "../components/VerseStates";
import { VerseContent } from "../components/VerseContent";
import { fmtDate, isToday } from "../helpers";

export default function UserDailyVerse() {
  const { t, isRtl } = useLanguage();
  const { verse, loading, refreshing, liked, setLiked, scrolled, scrollRef, navigate, refresh, handleCopy, handleShare } = useUserDailyVerse();

  if (loading) return <VerseLoadingSkeleton />;
  if (!verse) return <VerseEmptyState onBack={() => navigate(-1)} />;

  return (
    <div ref={scrollRef} className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent"}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5" /></Button>
          <Badge variant="outline" className="text-xs">{isToday(verse.displayDate) ? "Today\u2019s Verse" : fmtDate(verse.displayDate)}</Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={refresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
      <VerseContent verse={verse} liked={liked} onCopy={handleCopy} onShare={handleShare} onLike={() => setLiked(!liked)} />
    </div>
  );
}
