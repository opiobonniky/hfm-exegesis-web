// UserDailyVerse — user-facing daily verse reader (thin compositor)
import { useLanguage } from "@/components/languages/languageProvider";
import { useUserDailyVerse } from "../hooks";
import { VerseLoadingSkeleton, VerseEmptyState } from "../components/VerseStates";
import { VerseContent } from "../components/VerseContent";
import { UserVerseStickyHeader } from "../components/UserVerseStickyHeader";
import { fmtDate, isToday } from "../helpers";

export default function UserDailyVerse() {
  const { t, isRtl } = useLanguage();
  const {
    verse,
    loading,
    refreshing,
    liked,
    setLiked,
    scrolled,
    scrollRef,
    navigate,
    refresh,
    handleCopy,
    handleShare,
  } = useUserDailyVerse();

  if (loading) return <VerseLoadingSkeleton />;
  if (!verse) return <VerseEmptyState onBack={() => navigate(-1)} />;

  return (
    <div ref={scrollRef} className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <UserVerseStickyHeader
        label={isToday(verse.displayDate) ? "Today\u2019s Verse" : fmtDate(verse.displayDate)}
        scrolled={scrolled}
        refreshing={refreshing}
        onBack={() => navigate(-1)}
        onRefresh={refresh}
      />
      <VerseContent
        verse={verse}
        liked={liked}
        onCopy={handleCopy}
        onShare={handleShare}
        onLike={() => setLiked(!liked)}
      />
    </div>
  );
}
