import { BookOpen, CircleHelp, Heart, Lightbulb, ListChecks } from "lucide-react";
import type { ReactNode } from "react";
import type { DailyDevotionDetailData } from "../types";
import { parseList } from "../helpers/contentDetailHelpers";
import { tt } from "@/components/languages/hardcodedTranslate";

export function DevotionDetailContent({ devotion }: { devotion: DailyDevotionDetailData }) {
  return <section aria-label={tt("Devotional content")}>
    <div className="prologue-section-label"><span>{tt("Read and reflect")}</span><span>{devotion.title}</span></div>
    <div className="prologue-paper"><div className="prologue-card-grid">
      <EditorialSection title={tt("Explanation")} icon={<BookOpen />}><div className="prologue-prose whitespace-pre-line">{devotion.explanation}</div></EditorialSection>
      <EditorialSection title={tt("Reflection Questions")} icon={<CircleHelp />}><NumberedItems items={parseList(devotion.reflectionQuestions)} /></EditorialSection>
      <EditorialSection title={tt("Prayer")} icon={<Heart />}><div className="prologue-prose whitespace-pre-line">{devotion.prayer}</div></EditorialSection>
      <EditorialSection title={tt("Practical Application")} icon={<ListChecks />}><BulletItems items={parseList(devotion.practicalApplications)} /></EditorialSection>
      <EditorialSection title={tt("We Learn Three Things From This Devotional")} icon={<Lightbulb />}><BulletItems items={parseList(devotion.learningPoints)} /></EditorialSection>
    </div></div>
  </section>;
}

function EditorialSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="prologue-note prologue-note-wide"><div className="prologue-note-heading"><span className="prologue-note-icon" aria-hidden="true">{icon}</span><h2>{title}</h2></div>{children}</section>;
}
function NumberedItems({ items }: { items: string[] }) {
  return <ol className="prologue-numbered-list">{items.map((item, index) => <li key={index}><span className="prologue-list-number">{String(index + 1).padStart(2, "0")}</span><p className="prologue-prose">{item}</p></li>)}</ol>;
}
function BulletItems({ items }: { items: string[] }) {
  return <ul className="prologue-text-list">{items.map((item, index) => <li key={index}>{item}</li>)}</ul>;
}
