// UserDevotions — user-facing daily devotion reader (thin compositor)
import { useUserDevotions } from "../hooks";
import { DevotionStickyHeader } from "../components/DevotionStickyHeader";
import { DevotionContent } from "../components/DevotionContent";
import { Button } from '@/components/ui/button';
import { tt } from '@/components/languages/hardcodedTranslate';
import '../theme/userDevotions.css';

export default function UserDevotions() {
  const { data, actions } = useUserDevotions();
  const h = { ...data, ...actions };

  return (
    <div ref={h.scrollRef} className="book-prologue-view user-devotions h-full overflow-y-auto" dir={h.isRtl ? "rtl" : "ltr"}>
      <DevotionStickyHeader title={tt('Daily devotion')} scrolled={h.scrolled} refreshing={h.loading || h.refreshing} onBack={() => h.navigate(-1)} onRefresh={h.refresh} />
      {h.loading ? <main className="prologue-page-shell" role="status" aria-label={tt('Loading devotion')}>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-3 w-32 rounded bg-muted" /><div className="h-12 w-3/4 rounded bg-muted" />
          <div className="prologue-paper space-y-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-4 w-full rounded bg-muted" />)}</div>
        </div>
      </main> : h.devotion ? <DevotionContent devotion={h.devotion} liked={h.liked} onCopy={h.handleCopy} onShare={h.handleShare} onLike={() => h.setLiked(!h.liked)} /> :
        <main className="prologue-page-shell"><div className="prologue-paper devotion-empty">
          <h1>{tt('No devotion available today')}</h1><Button onClick={() => h.navigate(-1)} variant="outline">{tt('Go back')}</Button>
        </div></main>}
    </div>
  );
}
