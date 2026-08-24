// Verse explanation drawer — right-side panel matching app's section layout
import { useEffect, useState } from "react";
import {
  BookOpen, Loader2, Lightbulb, GraduationCap, BookMarked,
  Layers, Sparkles, ScrollText, ListChecks, RefreshCcw, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sendPostRequest } from "@/services/api";
  Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useLanguage } from "@/components/languages/languageProvider";
import type { LucideIcon } from "lucide-react";

interface VerseExplanationDrawerProps {
  open: boolean;
  onClose: () => void;
  bookName: string;
  chapter: number;
  verse: number;
}
/** Parse JSON-stringified list field */
function parseList<T = string>(raw: string | undefined | null): T[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; } catch { return []; }
interface WordStudy {
  word?: string;
  strongs?: string;
  definition?: string;
interface ExplanationData {
  verseIntroduction?: string;
  explanation?: string;
  application?: string;
  backgroundAuthor?: string;
  backgroundBook?: string;
  backgroundContext?: string;
  wordStudies?: string;
  practicalApplications?: string;
  keyThemes?: string;
  crossReferences?: string;
  learnMore?: string;
  finalThoughts?: string;
  takeaways?: string;
/** Section header with icon + label */
function Section({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">{label}</h4>
      </div>
      <div className="pl-1">{children}</div>
    </div>
  );
/** Sub-label for grouped content */
function SubLabel({ label }: { label: string }) {
  return <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mt-3 mb-1">{label}</p>;
/** Numbered list */
function NumberedList({ items }: { items: string[] }) {
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2.5 items-start">
          <span className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">{i + 1}</span>
          <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
        </div>
      ))}
/** Bullet list */
function BulletList({ items }: { items: string[] }) {
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
export default function VerseExplanationDrawer({ open, onClose, bookName, chapter, verse }: VerseExplanationDrawerProps) {
  const { isRtl, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExplanationData | null>(null);
  // Fetch explanation on open
  useEffect(() => {
    if (!open || !bookName) return;
    let cancelled = false;
    setLoading(true);
    setData(null);
    sendPostRequest("bible", "get-verse-explanation", { bookName, chapter, verseNumber: verse })
      .then((res) => {
        if (!cancelled && res.returnCode === 200 && res.returnData) {
          setData(res.returnData);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, bookName, chapter, verse]);
  // Parse structured fields
  const wordStudies = parseList<WordStudy>(data?.wordStudies);
  const practicalApps = parseList(data?.practicalApplications);
  const keyThemes = parseList(data?.keyThemes);
  const crossRefs = parseList(data?.crossReferences);
  const takeaways = parseList(data?.takeaways);
    <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <SheetContent side={isRtl ? "left" : "right"} className="w-full sm:max-w-[420px] p-0 gap-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="shrink-0 px-5 py-4 pe-12 border-b border-border text-start">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground">{t.bibleReader.explanation}</SheetTitle>
              <SheetDescription className="text-[11px] text-muted-foreground">{bookName} {chapter}:{verse}</SheetDescription>
          </div>
        </SheetHeader>
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">{t.bibleReader.loadingExplanation}</p>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No explanation available for this verse.</p>
          ) : (
            <>
              {/* Verse Introduction */}
              {data.verseIntroduction && (
                <Section icon={ScrollText} label="Verse Introduction">
                  <p className="text-sm text-foreground/80 leading-relaxed">{data.verseIntroduction}</p>
                </Section>
              )}
              {/* Explanation */}
              {data.explanation && (
                <Section icon={Lightbulb} label={t.bibleReader.explanation}>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{data.explanation}</p>
              {/* Application */}
              {data.application && (
                <Section icon={RefreshCcw} label="Application">
                  <p className="text-sm text-foreground/80 leading-relaxed">{data.application}</p>
              {/* Background */}
              {(data.backgroundAuthor || data.backgroundBook || data.backgroundContext) && (
                <Section icon={Layers} label="Background">
                  {data.backgroundAuthor && <><SubLabel label="Author" /><p className="text-sm text-foreground/80">{data.backgroundAuthor}</p></>}
                  {data.backgroundBook && <><SubLabel label="Book" /><p className="text-sm text-foreground/80">{data.backgroundBook}</p></>}
                  {data.backgroundContext && <><SubLabel label="Context" /><p className="text-sm text-foreground/80">{data.backgroundContext}</p></>}
              {/* Strong's Word Study */}
              {wordStudies.length > 0 && (
                <Section icon={GraduationCap} label="Word Study">
                  <div className="space-y-3">
                    {wordStudies.map((ws, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground">{ws.word}</span>
                          {ws.strongs && <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{ws.strongs}</span>}
                        </div>
                        {ws.definition && <p className="text-xs text-muted-foreground leading-relaxed">{ws.definition}</p>}
                      </div>
                    ))}
                  </div>
              {/* Practical Applications */}
              {practicalApps.length > 0 && (
                <Section icon={ListChecks} label={`${practicalApps.length} Practical Applications`}>
                  <NumberedList items={practicalApps} />
              {/* Insights and Cross References */}
              {(keyThemes.length > 0 || crossRefs.length > 0) && (
                <Section icon={Sparkles} label="Insights & Cross References">
                  {keyThemes.length > 0 && <><SubLabel label="Key Themes" /><BulletList items={keyThemes} /></>}
                  {crossRefs.length > 0 && <><SubLabel label="Cross References" /><BulletList items={crossRefs} /></>}
              {/* Learn More */}
              {data.learnMore && (
                <Section icon={BookMarked} label="Learn More">
                  <details className="group">
                    <summary className="flex items-center gap-1.5 text-xs font-semibold text-primary cursor-pointer hover:text-primary/80 transition-colors list-none">
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
                      Expand additional context
                    </summary>
                    <div className="mt-3 text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap pl-5">
                      {data.learnMore}
                    </div>
                  </details>
              {/* Final Thoughts */}
              {data.finalThoughts && (
                <Section icon={BookMarked} label="Final Thoughts">
                  <p className="text-sm text-foreground/80 leading-relaxed">{data.finalThoughts}</p>
              {/* Takeaways */}
              {takeaways.length > 0 && (
                <Section icon={Sparkles} label={`${takeaways.length} Takeaways`}>
                  <NumberedList items={takeaways} />
            </>
          )}
        {/* Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-border bg-muted/20">
          <SheetClose asChild>
            <button type="button" className="w-full py-2.5 rounded-xl bg-muted text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.bibleReader.closeExplanation}</button>
          </SheetClose>
      </SheetContent>
    </Sheet>
