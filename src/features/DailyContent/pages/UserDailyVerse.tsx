// UserDailyVerse — user-facing daily verse reader (thin compositor)
import { useUserDailyVerse } from "../hooks";
import { VerseContent } from "../components/VerseContent";
import { UserVerseStickyHeader } from "../components/UserVerseStickyHeader";
import { fmtDate, isToday } from "../helpers";
import { tt } from '@/components/languages/hardcodedTranslate';
import { Button } from '@/components/ui/button';
import '../theme/userDailyVerse.css';

export default function UserDailyVerse() {
  const { data, actions } = useUserDailyVerse();
  const h = { ...data, ...actions };

  return (
    <div ref={h.scrollRef} className="book-prologue-view user-devotions user-daily-verse h-full overflow-y-auto" dir={h.isRtl ? "rtl" : "ltr"}>
      <UserVerseStickyHeader
        label={h.verse ? (isToday(h.verse.displayDate) ? tt("Today’s Verse") : fmtDate(h.verse.displayDate)) : tt('Daily verse')}
        scrolled={h.scrolled}
        refreshing={h.loading || h.refreshing}
        onBack={() => h.navigate(-1)}
        onRefresh={h.refresh}
      />
      {h.loading ? <main className="prologue-page-shell" role="status" aria-label={tt('Loading verse')}>
        <div className="animate-pulse space-y-4" aria-hidden="true"><div className="h-3 w-32 rounded bg-muted" /><div className="h-12 w-2/3 rounded bg-muted" />
          <div className="prologue-paper space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-5 w-full rounded bg-muted" />)}</div>
        </div>
      </main> : h.verse ? <VerseContent
        verse={h.verse}
        liked={h.liked}
        onCopy={h.handleCopy}
        onShare={h.handleShare}
        onLike={() => h.setLiked(!h.liked)}
      /> : <main className="prologue-page-shell"><div className="prologue-paper devotion-empty">
        <h1>{tt('No verse available today')}</h1><Button onClick={() => h.navigate(-1)} variant="outline">{tt('Go back')}</Button>
      </div></main>}
    </div>
  );
}
