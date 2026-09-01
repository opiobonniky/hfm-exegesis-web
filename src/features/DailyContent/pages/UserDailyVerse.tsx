// UserDailyVerse — user-facing daily verse reader (thin compositor)
import { useUserDailyVerse } from "../hooks";
import { VerseLoadingSkeleton, VerseEmptyState } from "../components/VerseStates";
import { VerseContent } from "../components/VerseContent";
import { UserVerseStickyHeader } from "../components/UserVerseStickyHeader";
import { fmtDate, isToday } from "../helpers";

export default function UserDailyVerse() {
  const h = useUserDailyVerse();

  if (h.loading) return <VerseLoadingSkeleton />;
  if (!h.verse) return <VerseEmptyState onBack={() => h.navigate(-1)} />;

  return (
    <div ref={h.scrollRef} className="min-h-screen bg-background" dir={h.isRtl ? "rtl" : "ltr"}>
      <UserVerseStickyHeader
        label={isToday(h.verse.displayDate) ? "Today\u2019s Verse" : fmtDate(h.verse.displayDate)}
        scrolled={h.scrolled}
        refreshing={h.refreshing}
        onBack={() => h.navigate(-1)}
        onRefresh={h.refresh}
      />
      <VerseContent
        verse={h.verse}
        liked={h.liked}
        onCopy={h.handleCopy}
        onShare={h.handleShare}
        onLike={() => h.setLiked(!h.liked)}
      />
    </div>
  );
}
