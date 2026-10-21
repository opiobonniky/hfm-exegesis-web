import { useState } from "react";
import { Search, BookMarked, BookText, GraduationCap, MapPin, Lightbulb, ScrollText, FileText, Globe, Lock, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrongsWordData } from "@/services/strongsApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { tt } from '@/components/languages/hardcodedTranslate';
import TranslationComparisonAccordion from "./TranslationComparisonAccordion";

type LearnTab = "exegesis" | "language" | "history" | "prologue" | "crossrefs" | "geography" | "theology";

const TABS: { key: LearnTab; label: string; icon: React.ElementType }[] = [
  { key: "prologue", label: tt("Book Prologue"), icon: BookMarked },
  { key: "language", label: tt("Original Language"), icon: BookText },
  { key: "history", label: tt("Historical Context"), icon: GraduationCap },
  { key: "geography", label: tt("Geography"), icon: MapPin },
  { key: "theology", label: tt("Theology"), icon: Lightbulb },
  { key: "crossrefs", label: tt("Cross References"), icon: ScrollText },
  { key: "exegesis", label: tt("Study Notes"), icon: FileText },
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

  // The Learn tabs are a vertical list of collapsible sections. They used to
  // be a horizontal strip of pills that scrolled sideways, which hid most
  // of the tabs behind a scroll. Stacked vertically, each section is a row
  // the reader taps to open, and the open one shows its content below.
  const renderSections = () => (
    <div className="space-y-2">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isOpen = activeTab === key;
        return (
          <div key={key}>
            <button
              type="button"
              onClick={() => setActiveTab(key)}
              aria-expanded={isOpen}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-colors text-left",
                isOpen
                  ? "bg-primary/10 border-primary/20"
                  : "bg-card border-border/40 hover:bg-muted/30",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  isOpen ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span
                className={cn(
                  "flex-1 min-w-0 truncate text-sm font-medium",
                  isOpen ? "text-primary" : "text-foreground",
                )}
              >
                {label}
              </span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform",
                  isOpen ? "text-primary rotate-180" : "text-muted-foreground",
                )}
              />
            </button>

            {isOpen ? (
              <div className="mt-2 rounded-xl border border-border/40 bg-card p-4 space-y-3">
                {key === "exegesis" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Study Notes")}</h3>
                    <textarea value={learnNotes} onChange={(e) => setLearnNotes(e.target.value)}
                      placeholder={tt("Write your study notes, insights, and theological observations here...")}
                      className="w-full p-3 text-sm text-foreground bg-muted/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[180px]" />
                    {translationsLoading ? (
                      <div className="flex items-center justify-center gap-2 py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">{tt("Loading translations...")}</span>
                      </div>
                    ) : translations && translations.length > 0 ? (
                      <TranslationComparisonAccordion translations={translations} />
                    ) : null}
                  </>
                )}

                {key === "language" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Original Language — Strong's Words")}</h3>
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
                      <p className="text-xs text-muted-foreground py-4 text-center">{tt("No word study data available for this passage.")}</p>
                    )}
                  </>
                )}

                {key === "history" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Historical Context")}</h3>
                    {historicalContext ? (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{historicalContext}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">{tt("Historical context data not available for this passage.")}</p>
                    )}
                  </>
                )}

                {key === "geography" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Geography")}</h3>
                    {geography ? (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{geography}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">{tt("Geography data not available.")}</p>
                    )}
                  </>
                )}

                {key === "theology" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Theological Themes")}</h3>
                    {theology ? (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{theology}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">{tt("Theological themes data not available.")}</p>
                    )}
                  </>
                )}

                {key === "crossrefs" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Cross References")}</h3>
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
                      <p className="text-xs text-muted-foreground py-4 text-center">{tt("No cross references available.")}</p>
                    )}
                  </>
                )}

                {key === "prologue" && (
                  <>
                    <h3 className="text-sm font-bold text-foreground">{tt("Book Prologue —")}{bookName}</h3>
                    {prologue ? (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{prologue}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">{tt("No book prologue available.")}</p>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stage header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Search className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{tt("Step 3 of 5")}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">{tt("~15 min")}</span>
          </div>
          <h2 className="text-base font-bold text-foreground">{tt("Learn — Study the Word")}</h2>
          <p className="text-xs text-muted-foreground">{tt("What does this mean? Dig deeper into meaning and context.")}</p>
        </div>
      </div>

      {/* Loading */}
      {learnDataLoading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">{tt("Loading study data...")}</span>
        </div>
      )}

      {/* Sections */}
      {renderSections()}

      {/* Privacy toggle */}
      <button onClick={() => setIsPublic(!isPublic)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/40 hover:bg-muted/20 transition-colors w-full text-left">
        {isPublic ? <Globe className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4 text-green-500" />}
        <div>
          <p className="text-sm font-medium text-foreground">{isPublic ? tt("Public") : tt("Private")}</p>
          <p className="text-[10px] text-muted-foreground">{isPublic ? tt("Anyone can read") : tt("Only you can see")}</p>
        </div>
      </button>

      {/* Continue button */}
      <button onClick={onAdvance} disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{tt("Save & Continue to Abide →")}</button>
    </div>
  );
}
