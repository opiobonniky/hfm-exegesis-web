import { Heart, Sparkles, Crosshair, Footprints, BookMarked, Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  reflection: string;
  setReflection: (v: string) => void;
  prayer: string;
  setPrayer: (v: string) => void;
  appText: string;
  setAppText: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  saving: boolean;
  onAdvance: () => void;
}

const QUESTIONS = [
  { id: 1, icon: Sparkles, label: "What has God shown you?", placeholder: "Record what the Lord has revealed to you through this passage...", color: "emerald" },
  { id: 2, icon: Crosshair, label: "How does this strengthen your faith?", placeholder: "What truths have deepened your trust in God?", color: "blue" },
  { id: 3, icon: Footprints, label: "What is your next step?", placeholder: "One specific, practical action you will take this week...", color: "amber" },
  { id: 4, icon: BookMarked, label: "What have you gained?", placeholder: "What spiritual insight or treasure are you taking away?", color: "purple" },
];

const COLOR_MAP: Record<string, { bg: string; border: string; icon: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-l-emerald-500/40", icon: "text-emerald-600" },
  blue: { bg: "bg-blue-500/10", border: "border-l-blue-500/40", icon: "text-blue-600" },
  amber: { bg: "bg-amber-500/10", border: "border-l-amber-500/40", icon: "text-amber-600" },
  purple: { bg: "bg-purple-500/10", border: "border-l-purple-500/40", icon: "text-purple-600" },
};

export default function LabAbideStage({
  reflection, setReflection, prayer, setPrayer, appText, setAppText, tags, setTags,
  isPublic, setIsPublic, saving, onAdvance,
}: Props) {
  const fieldValues = [reflection, prayer, appText, tags];
  const fieldSetters = [setReflection, setPrayer, setAppText, setTags];

  return (
    <div className="space-y-5">
      {/* Stage header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step 4 of 5</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-semibold">~10 min</span>
          </div>
          <h2 className="text-base font-bold text-foreground">Abide — Reflect and Respond</h2>
          <p className="text-xs text-muted-foreground">The goal of study is transformation. Record what God has shown you.</p>
        </div>
      </div>

      {/* Question cards */}
      {QUESTIONS.map((q, idx) => {
        const colors = COLOR_MAP[q.color];
        return (
          <div key={q.id} className={cn("rounded-xl border border-border/40 bg-card overflow-hidden border-l-4", colors.border)}>
            <div className="flex items-center gap-3 p-4 pb-2">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colors.bg)}>
                <q.icon className={cn("w-4 h-4", colors.icon)} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{q.label}</p>
              </div>
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", colors.bg, colors.icon)}>
                {q.id}
              </span>
            </div>
            <textarea
              value={fieldValues[idx]}
              onChange={(e) => fieldSetters[idx](e.target.value)}
              placeholder={q.placeholder}
              className="w-full px-4 pb-4 text-sm text-foreground bg-transparent resize-none focus:outline-none min-h-[80px]"
            />
          </div>
        );
      })}

      {/* Privacy toggle */}
      <button onClick={() => setIsPublic(!isPublic)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/40 hover:bg-muted/20 transition-colors w-full text-left">
        {isPublic ? <Globe className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4 text-green-500" />}
        <div>
          <p className="text-sm font-medium text-foreground">{isPublic ? "Public" : "Private"}</p>
          <p className="text-[10px] text-muted-foreground">{isPublic ? "Anyone can read" : "Only you can see"}</p>
        </div>
      </button>

      {/* Save & Continue */}
      <button onClick={onAdvance} disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Save & Complete Study
      </button>
    </div>
  );
}
