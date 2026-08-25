import { BookOpen, Heart, Copy, Share2, Lightbulb, GraduationCap, BookMarked, Sparkles, ScrollText, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerseSection, SubLabel, NumberedList, BulletList, WordStudyList, BackgroundSection, parseList } from "./DailyVerseSections";
import { fmtDate, isToday } from "../helpers";

interface VerseData {
  bookName: string; chapter: number; verseNumber: number; bibleVersion?: string;
  verseText?: string; reflection?: string; displayDate: any; verseIntroduction?: string;
  explanation?: string; application?: string; backgroundAuthor?: string; backgroundBook?: string;
  backgroundContext?: string; wordStudies?: string; practicalApplications?: string;
  keyThemes?: string; crossReferences?: string; finalThoughts?: string; takeaways?: string;
  learnMore?: string;
}
interface Props {
  verse: VerseData; accent?: string; liked: boolean;
  onCopy: () => void; onShare: () => void; onLike: () => void;
}
export function VerseContent({ verse, accent = "hsl(var(--primary))", liked, onCopy, onShare, onLike }: Props) {
  const wordStudies = parseList(verse.wordStudies);
  const practicalApps = parseList(verse.practicalApplications);
  const keyThemes = parseList(verse.keyThemes);
  const crossRefs = parseList(verse.crossReferences);
  const takeaways = parseList(verse.takeaways);
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{verse.bookName} {verse.chapter}:{verse.verseNumber}</h1>
        {verse.bibleVersion && <Badge variant="secondary" className="text-xs">{verse.bibleVersion}</Badge>}
        <p className="text-lg leading-relaxed text-foreground/85 italic" style={{ fontFamily: "'Lora', serif" }}>
          {"\u201C"}{verse.verseText || verse.reflection || "Verse text not available"}{"\u201D"}
        </p>
        <div className="flex items-center justify-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onCopy} className="h-8 gap-1.5 text-xs"><Copy className="w-3.5 h-3.5" /> Copy</Button>
          <Button variant="outline" size="sm" onClick={onShare} className="h-8 gap-1.5 text-xs"><Share2 className="w-3.5 h-3.5" /> Share</Button>
          <Button variant={liked ? "default" : "outline"} size="sm" onClick={onLike} className={`h-8 gap-1.5 text-xs ${liked ? "text-rose-500" : ""}`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} /> {liked ? "Liked" : "Like"}
          </Button>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      {verse.verseIntroduction && <VerseSection label="Verse Introduction" icon={ScrollText} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{verse.verseIntroduction}</p></VerseSection>}
      {verse.explanation && <VerseSection label="Explanation" icon={Lightbulb} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{verse.explanation}</p></VerseSection>}
      {verse.application && <VerseSection label="Application" icon={ListChecks} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{verse.application}</p></VerseSection>}
      <BackgroundSection author={verse.backgroundAuthor} book={verse.backgroundBook} context={verse.backgroundContext} accent={accent} />
      {wordStudies.length > 0 && <VerseSection label="Strong Concordance Word Study" icon={GraduationCap} accent={accent}><WordStudyList items={wordStudies} accent={accent} /></VerseSection>}
      {practicalApps.length > 0 && <VerseSection label="Practical Applications" icon={ListChecks} accent={accent} count={practicalApps.length}><NumberedList items={practicalApps} accent={accent} /></VerseSection>}
      {(keyThemes.length > 0 || crossRefs.length > 0) && (
        <VerseSection label="Insights and Cross References" icon={Sparkles} accent={accent}>
          {keyThemes.length > 0 && <div className="space-y-2"><SubLabel label="Key Themes" accent={accent} /><BulletList items={keyThemes} accent={accent} /></div>}
          {crossRefs.length > 0 && <div className="space-y-2"><SubLabel label="Cross References" accent={accent} /><BulletList items={crossRefs} accent={accent} /></div>}
        </VerseSection>
      )}
      {verse.finalThoughts && <VerseSection label="Final Thoughts" icon={BookMarked} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{verse.finalThoughts}</p></VerseSection>}
      {takeaways.length > 0 && <VerseSection label="Takeaways" icon={Sparkles} accent={accent} count={takeaways.length}><NumberedList items={takeaways} accent={accent} /></VerseSection>}
      {verse.learnMore && <VerseSection label="Learn More" icon={BookMarked} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{verse.learnMore}</p></VerseSection>}
      <div className="text-center py-8"><p className="text-sm text-muted-foreground italic">Meditate on this verse today.</p></div>
    </div>
  );
}
