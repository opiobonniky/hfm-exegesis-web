"use client";
import { Sun, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";

export default function DailyVerseHeader({ onAdd }: { onAdd: () => void }) {
  const { userInfo } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Sun className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t.dailyVerse?.dailyVerse || "Daily Verse"}</h1>
          <p className="text-sm text-muted-foreground">{t.dailyVerse?.pageSubtitle || "Start each day with God's Word"}</p>
        </div>
      </div>
      {isAdmin && (
        <Button onClick={onAdd} size="sm" className="gap-2 w-fit">
          <Plus className="w-4 h-4" />
          {t.dailyVerse?.addVerse || "Add Daily Verse"}
        </Button>
      )}
    </div>
  );
}
