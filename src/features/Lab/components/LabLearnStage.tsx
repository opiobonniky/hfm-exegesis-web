import { useState } from "react";
import { Search, BookMarked, BookText, GraduationCap, MapPin, Lightbulb, ScrollText, FileText, Globe, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrongsWordData } from "@/services/strongsApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";

type LearnTab = "exegesis" | "language" | "history" | "prologue" | "crossrefs" | "geography" | "theology";

const TABS: { key: LearnTab; label: string; icon: React.ElementType }[] = [
  { key: "exegesis", label: "Study Notes", icon: FileText },
  { key: "language", label: "Original Language", icon: BookText },
  { key: "history", label: "Historical Context", icon: GraduationCap },
  { key: "geography", label: "Geography", icon: MapPin },
  { key: "theology", label: "Theology", icon: Lightbulb },
  { key: "crossrefs", label: "Cross References", icon: ScrollText },
  { key: "prologue", label: "Book Prologue", icon: BookMarked },
];

interface Props {
  passageRef: string;
  bookName: string;
  chapter: string;
  verseStart: string;
  learnNotes: string;
  setLearnNotes: (v: string) => void;
  learnDataLoading: boolean;
  verseResources: VerseResourceData | null;
  bookPrologue: BookPrologue | null;
  verseWords: StrongsWordData[];
  translations: TranslationComparisonEntry[] | null;
  translationsLoading: boolean;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  saving: boolean;
  onAdvance: () => void;
  onWordTap: (strongsId: string) => void;
}

export default function LabLearnStage({
  passageRef, bookName, chapter, verseStart, learnNotes, setLearnNotes,
  learnDataLoading, verseResources, bookPrologue, verseWords, translations, translationsLoading,
  isPublic, setIsPublic, saving, onAdvance, onWordTap,
}: Props) {
  const [activeTab, setActiveTab] = useState<LearnTab>("exegesis");
  const historicalContext = verseResources?.commentaries?.[0]?.text;
  const geography = verseResources?.studyTools?.find((tool) => tool.toolType === "geography")?.description;
  const theology = verseResources?.relatedTopics?.map((topic) => topic.name).join(", ");
  const prologue = bookPrologue?.summary || bookPrologue?.background;

  return (
    <div className="space-y-5">
      {/* Stage header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Search className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step 3 of 5</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">~15 min</span>
          </div>
          <h2 className="text-base font-bold text-foreground">Learn — Study the Word</h2>
          <p className="text-xs text-muted-foreground">What does this mean? Dig deeper into meaning and context.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
              activeTab === key
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-card border border-border/40 text-muted-foreground hover:bg-muted/30"
            )}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {learnDataLoading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading study data...</span>
        </div>
      )}

      {/* Tab content */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        {/* Exegesis / Study Notes */}
        {activeTab === "exegesis" && (
          <div className="p-4 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Study Notes</h3>
            <textarea value={learnNotes} onChange={(e) => setLearnNotes(e.target.value)}
              placeholder="Write your study notes, insights, and theological observations here..."
              className="w-full p-3 text-sm text-foreground bg-muted/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[180px]" />
            {translations && translations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Translation Comparison</p>
                {translations.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <p className="text-[10px] font-bold text-primary mb-1">{t.version}</p>
                    <p className="text-sm text-foreground/80 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Language / Original Language */}
        {activeTab === "language" && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Original Language — Strong's Words</h3>
            {verseWords.length > 0 ? (
              <div className="space-y-1">
                {verseWords.map((w, idx) => (
                  <button key={idx} onClick={() => w.strongsId && onWordTap(w.strongsId)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors text-left">
                    <span className="text-sm font-medium text-foreground">{w.surfaceText}</span>
                    {w.lemma && <span className="text-xs text-amber-600 italic">{w.lemma}</span>}
                    {w.strongsId && <span className="text-[10px] font-mono text-muted-foreground ml-auto">{w.strongsId}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No word study data available for this passage.</p>
            )}
          </div>
        )}

        {/* Historical Context */}
        {activeTab === "history" && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Historical Context</h3>
            {historicalContext ? (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{historicalContext}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Historical context data not available for this passage.</p>
            )}
          </div>
        )}

        {/* Geography */}
        {activeTab === "geography" && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Geography</h3>
            {geography ? (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{geography}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Geography data not available.</p>
            )}
          </div>
        )}

        {/* Theology */}
        {activeTab === "theology" && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Theological Themes</h3>
            {theology ? (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{theology}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Theological themes data not available.</p>
            )}
          </div>
        )}

        {/* Cross References */}
        {activeTab === "crossrefs" && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Cross References</h3>
            {verseResources?.crossReferences && verseResources.crossReferences.length > 0 ? (
              <div className="space-y-2">
                {verseResources.crossReferences.map((ref, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <p className="text-xs font-bold text-primary mb-1">{ref.ref}</p>
                    <p className="text-sm text-foreground/80 italic">{ref.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No cross references available.</p>
            )}
          </div>
        )}

        {/* Book Prologue */}
        {activeTab === "prologue" && (
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Book Prologue — {bookName}</h3>
            {prologue ? (
              <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{prologue}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">No book prologue available.</p>
            )}
          </div>
        )}
      </div>

      {/* Privacy toggle */}
      <button onClick={() => setIsPublic(!isPublic)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/40 hover:bg-muted/20 transition-colors w-full text-left">
        {isPublic ? <Globe className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4 text-green-500" />}
        <div>
          <p className="text-sm font-medium text-foreground">{isPublic ? "Public" : "Private"}</p>
          <p className="text-[10px] text-muted-foreground">{isPublic ? "Anyone can read" : "Only you can see"}</p>
        </div>
      </button>

      {/* Continue button */}
      <button onClick={onAdvance} disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Save & Continue to Abide →
      </button>
    </div>
  );
}
