// UserDevotions — user-facing daily devotion reader (thin compositor)
import { useUserDevotions } from "../hooks";
import { VerseLoadingSkeleton, DevotionEmptyState } from "../components/VerseStates";
import { DevotionStickyHeader } from "../components/DevotionStickyHeader";
import { DevotionContent } from "../components/DevotionContent";

export default function UserDevotions() {
  const h = useUserDevotions();

  if (h.loading) return <VerseLoadingSkeleton />;
  if (!h.devotion) return <DevotionEmptyState onBack={() => h.navigate(-1)} />;

  return (
    <div ref={h.scrollRef} className="min-h-screen bg-background" dir={h.isRtl ? "rtl" : "ltr"}>
      <DevotionStickyHeader title={h.devotion.title} scrolled={h.scrolled} refreshing={h.refreshing} onBack={() => h.navigate(-1)} onRefresh={h.refresh} />
      <DevotionContent devotion={h.devotion} liked={h.liked} onCopy={h.handleCopy} onShare={h.handleShare} onLike={() => h.setLiked(!h.liked)} />
    </div>
  );
}
