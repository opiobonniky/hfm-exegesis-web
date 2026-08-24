import { useLanguage } from "@/components/languages/languageProvider";
import { useUserDevotions } from "../hooks";
import { VerseLoadingSkeleton, DevotionEmptyState } from "../components/VerseStates";
import { DevotionStickyHeader } from "../components/DevotionStickyHeader";
import { DevotionContent } from "../components/DevotionContent";

export default function UserDevotions() {
  const { t, isRtl } = useLanguage();
  const { devotion, loading, refreshing, liked, setLiked, scrolled, scrollRef, navigate, refresh, handleCopy, handleShare } = useUserDevotions();

  if (loading) return <VerseLoadingSkeleton />;
  if (!devotion) return <DevotionEmptyState onBack={() => navigate(-1)} />;

  return (
    <div ref={scrollRef} className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <DevotionStickyHeader title={devotion.title} scrolled={scrolled} refreshing={refreshing} onBack={() => navigate(-1)} onRefresh={refresh} />
      <DevotionContent devotion={devotion} liked={liked} onCopy={handleCopy} onShare={handleShare} onLike={() => setLiked(!liked)} />
    </div>
  );
}
