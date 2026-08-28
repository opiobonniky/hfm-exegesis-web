import { useState, useRef, useEffect } from "react";
import { Eye, BookOpen, MessageSquareQuote, ChevronLeft, ChevronRight, Copy, Check, Share2, NotebookPen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOOK_PROMPTS } from "@/hooks/useLabFlow";

interface Verse { verseNumber: number; text: string; }

interface Props {
  passageRef: string;
  bookName: string;
  chapter: string;
  passageVerses: Verse[];
  versesLoading: boolean;
  lookNotes: string;
  setLookNotes: (v: string) => void;
  saving: boolean;
  onAdvance: () => void;
}

export default function LabLookStage({
  passageRef, bookName, chapter, passageVerses, versesLoading, lookNotes, setLookNotes, saving, onAdvance,
}: Props) {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const [copied, setCopied] = useState(false);
  const promptNotesRef = useRef<Record<number, string>>({});

  const promptNotes = lookNotes;

  const handleTextChange = (text: string) => {
    setLookNotes(text);
    promptNotesRef.current[currentPrompt] = text;
  };

  const switchPrompt = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= LOOK_PROMPTS.length) return;
    promptNotesRef.current[currentPrompt] = lookNotes;
    const nextNotes = promptNotesRef.current[nextIdx] ?? "";
    setLookNotes(nextNotes);
    setCurrentPrompt(nextIdx);
  };

  const verseRange = passageVerses.length === 0 ? null
    : passageVerses[0].verseNumber === passageVerses[passageVerses.length - 1].number
      ? `v. ${passageVerses[0].verseNumber}`
      : `vv. ${passageVerses[0].verseNumber}–${passageVerses[passageVerses.length - 1].verseNumber}`;

  const handleCopy = () => {
    const text = passageVerses.map((v) => `${v.verseNumber} ${v.text}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `${passageRef}\n\n${passageVerses.map((v) => `${v.verseNumber} ${v.text}`).join("\n")}`;
    if (navigator.share) navigator.share({ title: passageRef, text });
    else navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-5">
      {/* Stage header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Eye className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Step 1 of 5</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold">~10 min</span>
          </div>
          <h2 className="text-base font-bold text-foreground">Look — Read and Observe</h2>
          <p className="text-xs text-muted-foreground">What does the text say? Observe carefully.</p>
        </div>
      </div>

      {/* Scripture passage card */}
      {versesLoading ? (
        <div className="p-6 rounded-xl border border-border/40 bg-card flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading passage...</span>
        </div>
      ) : passageVerses.length > 0 ? (
        <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-primary/[0.02]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{bookName} {chapter}</span>
              {verseRange && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{verseRange}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors">
                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={handleCopy} className={cn("p-1.5 rounded-lg transition-colors", copied ? "bg-green-500/10" : "hover:bg-muted/60")}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>
          <div className="p-4 space-y-1">
            {passageVerses.map((v) => (
              <div key={v.verseNumber} className="flex gap-2">
                <sup className="text-[10px] font-bold text-primary mt-1 shrink-0">{v.verseNumber}</sup>
                <p className="text-sm leading-7 text-foreground/90">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Observation prompt card */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-start gap-3 p-4 border-b border-border/30 bg-muted/10">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquareQuote className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-sm text-foreground leading-relaxed flex-1">{LOOK_PROMPTS[currentPrompt]}</p>
        </div>
        <textarea
          value={promptNotes}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Write your observation here..."
          className="w-full p-4 text-sm text-foreground bg-transparent resize-none focus:outline-none min-h-[120px]"
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <button onClick={() => switchPrompt(currentPrompt - 1)} disabled={currentPrompt === 0}
            className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              currentPrompt === 0 ? "opacity-30 cursor-not-allowed" : "bg-primary text-white hover:opacity-90")}>
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-[10px] font-bold text-muted-foreground">{currentPrompt + 1} / {LOOK_PROMPTS.length}</span>
          <button onClick={() => switchPrompt(currentPrompt + 1)} disabled={currentPrompt === LOOK_PROMPTS.length - 1}
            className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              currentPrompt === LOOK_PROMPTS.length - 1 ? "opacity-30 cursor-not-allowed" : "bg-primary text-white hover:opacity-90")}>
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Your Observations */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
          <NotebookPen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Your Observations</span>
        </div>
        <textarea
          value={lookNotes}
          onChange={(e) => setLookNotes(e.target.value)}
          placeholder="What did you observe? Write freely..."
          className="w-full p-4 text-sm text-foreground bg-transparent resize-none focus:outline-none min-h-[140px]"
        />
      </div>

      {/* Continue button */}
      <button onClick={onAdvance} disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Save & Continue to Listen →
      </button>
    </div>
  );
}
