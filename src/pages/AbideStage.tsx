import { BookMarked as BookMarkedIcon, BookOpen, FileText, Heart, Lock, Save, Tag, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AbideStageProps {
  reflection: string;
  prayer: string;
  appText: string;
  tags: string;
  isPublic: boolean;
  passageRef: string | null;
  saving: boolean;
  onUpdate: (updates: Record<string, any>) => void;
  onSaveAbide: () => void;
  onSaveProgress: () => void;
  stageLabel: string;
}

export default function AbideStage({
  reflection,
  prayer,
  appText,
  tags,
  isPublic,
  passageRef,
  saving,
  onUpdate,
  onSaveAbide,
  onSaveProgress,
  stageLabel,
}: AbideStageProps) {
  const { isRtl } = useLanguage();

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Stage header */}
      <div className="flex flex-col items-center pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-0.5">
          Step 4 of 4
        </p>
        <h2 className="text-lg font-black text-foreground">Abide</h2>
        <p className="text-xs text-muted-foreground">{stageLabel}</p>
        {passageRef && (
          <Badge
            variant="outline"
            className="mt-2 text-[11px] font-bold bg-primary/10 border-primary/20 text-primary gap-1"
          >
            <BookOpen className="w-3 h-3" />
            {passageRef}
          </Badge>
        )}
      </div>

      {/* Reflection */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2">
          <FileText className="w-3.5 h-3.5 inline mr-1" />
          My Reflection
        </p>
        <textarea
          value={reflection}
          onChange={(e) => onUpdate({ reflection: e.target.value })}
          placeholder="What has God shown you through this passage?"
          rows={5}
          className="w-full rounded-xl border border-border bg-card text-foreground text-sm p-3 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Prayer */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2">
          <Heart className="w-3.5 h-3.5 inline mr-1" />
          My Prayer
        </p>
        <textarea
          value={prayer}
          onChange={(e) => onUpdate({ prayer: e.target.value })}
          placeholder="Write your prayer response..."
          rows={5}
          className="w-full rounded-xl border border-border bg-card text-foreground text-sm p-3 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Application */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2">
          <BookMarkedIcon className="w-3.5 h-3.5 inline mr-1" />
          Practical Step
        </p>
        <textarea
          value={appText}
          onChange={(e) => onUpdate({ appText: e.target.value })}
          placeholder="What will you do in response to God's Word?"
          rows={3}
          className="w-full rounded-xl border border-border bg-card text-foreground text-sm p-3 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-2">
          <Tag className="w-3.5 h-3.5 inline mr-1" />
          Tags
        </p>
        <input
          type="text"
          value={tags}
          onChange={(e) => onUpdate({ tags: e.target.value })}
          placeholder="#John #Believe #EternalLife"
          className="w-full h-10 rounded-xl border border-border bg-card text-foreground text-sm px-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Privacy toggle */}
      <button
        onClick={() => onUpdate({ isPublic: !isPublic })}
        className={cn(
          "flex items-center gap-2 p-3 rounded-xl border transition-all active:scale-[0.97] [touch-action:manipulation]",
          isPublic
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-card border-border",
        )}
      >
        <Lock
          className={cn(
            "w-4 h-4",
            isPublic ? "text-amber-500" : "text-green-500",
          )}
        />
        <span className="text-sm font-medium text-foreground">
          {isPublic
            ? "Public — anyone can read this"
            : "Private — only you can see this"}
        </span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveProgress}
          disabled={saving}
          className="gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save Progress"}
        </Button>
        <div className="flex-1" />
        <Button
          onClick={onSaveAbide}
          disabled={saving}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save to Legacy Ledger"}
        </Button>
      </div>
    </div>
  );
}
