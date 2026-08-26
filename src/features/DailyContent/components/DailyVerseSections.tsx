import type { ReactNode } from "react";
import { Layers, GraduationCap, Sparkles, ScrollText, ListChecks, BookMarked } from "lucide-react";

export const parseDate = (d: unknown): string => {
  if (!d) return new Date().toISOString();
  if (typeof d === "string") return d;
  if (typeof d === "object" && d !== null) {
    const value = d as { seconds?: number; _seconds?: number };
    const seconds = value.seconds ?? value._seconds;
    if (seconds) return new Date(seconds * 1000).toISOString();
  }
  return new Date().toISOString();
};
export const parseList = (raw?: string | null): unknown[] => {
  if (!raw) return [];
  try { const parsed: unknown = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};
interface SectionProps { label: string; icon: React.ElementType; accent?: string; count?: number; children: ReactNode; }
export function VerseSection({ label, icon: Icon, accent = "hsl(var(--primary))", count, children }: SectionProps) {
  return <div className="space-y-3"><div className="flex items-center gap-2"><Icon className="w-4 h-4" style={{ color: accent }} /><h3 className="text-xs font-extrabold tracking-wider uppercase" style={{ color: accent }}>{label}{count ? ` (${count})` : ""}</h3></div><div className="pl-6 space-y-2">{children}</div></div>;
}
export function SubLabel({ label, accent = "hsl(var(--primary))" }: { label: string; accent?: string }) {
  return <p className="text-[11px] font-extrabold tracking-wide uppercase mb-1" style={{ color: accent }}>{label}</p>;
}
export function NumberedList({ items, accent = "hsl(var(--primary))" }: { items: string[]; accent?: string }) {
  return <ol className="space-y-2">{items.map((item, i) => <li key={i} className="flex items-start gap-2.5"><span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold" style={{ backgroundColor: accent + "18", color: accent }}>{i + 1}</span><span className="text-sm text-muted-foreground leading-relaxed">{item}</span></li>)}</ol>;
}
export function BulletList({ items, accent = "hsl(var(--primary))" }: { items: string[]; accent?: string }) {
  return <ul className="space-y-2">{items.map((item, i) => <li key={i} className="flex items-start gap-2.5"><span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} /><span className="text-sm text-muted-foreground leading-relaxed">{item}</span></li>)}</ul>;
}
interface WordStudy { word: string; strongs?: string; definition?: string; }
export function WordStudyList({ items, accent = "hsl(var(--primary))" }: { items: WordStudy[]; accent?: string }) {
  return <div className="space-y-4">{items.map((w, i) => <div key={i} className="space-y-1"><div className="flex items-baseline gap-2 flex-wrap"><span className="text-sm font-extrabold" style={{ color: accent }}>{w.word}</span>{w.strongs && <span className="text-[11px] font-bold" style={{ color: accent + "CC" }}>{w.strongs}</span>}</div>{w.definition && <p className="text-sm text-muted-foreground leading-relaxed">{w.definition}</p>}</div>)}</div>;
}
interface BackgroundProps { author?: string | null; book?: string | null; context?: string | null; accent?: string; }
export function BackgroundSection({ author, book, context, accent = "hsl(var(--primary))" }: BackgroundProps) {
  if (!author && !book && !context) return null;
  return <VerseSection label="Background" icon={Layers} accent={accent}><div className="space-y-3">{author && <div><SubLabel label="Author" accent={accent} /><p className="text-sm text-muted-foreground leading-relaxed">{author}</p></div>}{book && <div><SubLabel label="Book" accent={accent} /><p className="text-sm text-muted-foreground leading-relaxed">{book}</p></div>}{context && <div><SubLabel label="Context" accent={accent} /><p className="text-sm text-muted-foreground leading-relaxed">{context}</p></div>}</div></VerseSection>;
}
export { ScrollText, GraduationCap, ListChecks, Sparkles, BookMarked, Layers };
