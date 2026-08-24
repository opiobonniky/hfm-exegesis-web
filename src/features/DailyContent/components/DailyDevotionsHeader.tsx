import { Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";

export function DailyDevotionsHeader({ onAdd }: { onAdd: () => void }) {
  const { userInfo } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  return (
    <div className="fade-up flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
            {t.devotions?.dailyDevotions || "Daily Devotion"}
          </h1>
          <p className="text-muted-foreground">
            {t.devotions?.pageSubtitle || "Spiritual reflections for each day"}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Button onClick={onAdd} className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md w-fit">
          <Plus className="w-4 h-4" />{t.devotions?.addDevotion || "Add Devotion"}
        </Button>
      )}
    </div>
  );
}
