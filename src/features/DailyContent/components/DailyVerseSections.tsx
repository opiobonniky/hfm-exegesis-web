import { ReactNode } from "react";
import {
  Layers, GraduationCap, Sparkles, ScrollText,
  ListChecks, BookMarked,
} from "lucide-react";

export const parseDate = (d: any): string => {
  if (!d) return new Date().toISOString();
  if (typeof d === "string") return d;
  try {
    const o = d as any;
    if (o.seconds) return new Date(o.seconds * 1000).toISOString();
    if (o._seconds) return new Date(o._seconds * 1000).toISOString();
  } catch {}
  return new Date().toISOString();
};
export const parseList = (raw: string | undefined | null): any[] => {
  if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
interface SectionProps {
  label: string;
  icon: React.ElementType;
  accent?: string;
  count?: number;
  children: ReactNode;
}
export function VerseSection({ label, icon: Icon, accent = "hsl(var(--primary))", count, children }: SectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" style={{ color: accent }} />
        <h3 className="text-xs font-extrabold tracking-wider uppercase" style={{ color: accent }}>
          {label}{count ? ` (${count})` : ""}
        </h3>
      </div>
      <div className="pl-6 space-y-2">{children}</div>
    </div>
  );
export function SubLabel({ label, accent = "hsl(var(--primary))" }: { label: string; accent?: string }) {
    <p className="text-[11px] font-extrabold tracking-wide uppercase mb-1" style={{ color: accent }}>
      {label}
    </p>
export function NumberedList({ items, accent = "hsl(var(--primary))" }: { items: string[]; accent?: string }) {
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold"
            style={{ backgroundColor: accent + "18", color: accent }}
          >
            {i + 1}
          </span>
          <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
export function BulletList({ items, accent = "hsl(var(--primary))" }: { items: string[]; accent?: string }) {
    <ul className="space-y-2">
          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
    </ul>
interface WordStudy {
  word: string;
  strongs?: string;
  definition?: string;
export function WordStudyList({ items, accent = "hsl(var(--primary))" }: { items: WordStudy[]; accent?: string }) {
    <div className="space-y-4">
      {items.map((w, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-extrabold" style={{ color: accent }}>{w.word}</span>
            {w.strongs && (
              <span className="text-[11px] font-bold" style={{ color: accent + "CC" }}>{w.strongs}</span>
            )}
          </div>
          {w.definition && (
            <p className="text-sm text-muted-foreground leading-relaxed">{w.definition}</p>
          )}
        </div>
interface BackgroundProps {
  author?: string | null;
  book?: string | null;
  context?: string | null;
export function BackgroundSection({ author, book, context, accent = "hsl(var(--primary))" }: BackgroundProps) {
  if (!author && !book && !context) return null;
    <VerseSection label="Background" icon={Layers} accent={accent}>
      <div className="space-y-3">
        {author && (
          <div>
            <SubLabel label="Author" accent={accent} />
            <p className="text-sm text-muted-foreground leading-relaxed">{author}</p>
        )}
        {book && (
            <SubLabel label="Book" accent={accent} />
            <p className="text-sm text-muted-foreground leading-relaxed">{book}</p>
        {context && (
            <SubLabel label="Context" accent={accent} />
            <p className="text-sm text-muted-foreground leading-relaxed">{context}</p>
    </VerseSection>
export { ScrollText, GraduationCap, ListChecks, Sparkles, BookMarked, Layers };
