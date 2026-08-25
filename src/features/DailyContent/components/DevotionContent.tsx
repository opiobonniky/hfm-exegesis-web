import { BookOpen, Calendar, Heart, Copy, Share2, Lightbulb, GraduationCap, BookMarked, Sparkles, ScrollText, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerseSection, SubLabel, NumberedList, BulletList, WordStudyList, BackgroundSection, parseList } from "./DailyVerseSections";
import { fmtDate } from "../helpers";

interface DevotionData {
  title: string; displayDate: any; bookName?: string; chapter?: number; verseNumber?: number;
  bibleVersion?: string; content: string; explanation?: string; application?: string;
  verseIntroduction?: string; backgroundAuthor?: string; backgroundBook?: string; backgroundContext?: string;
  wordStudies?: string; practicalApplications?: string; keyThemes?: string; crossReferences?: string;
  finalThoughts?: string; takeaways?: string; learnMore?: string;
}

interface Props {
  devotion: DevotionData; accent?: string; liked: boolean;
  onCopy: () => void; onShare: () => void; onLike: () => void;
}

export function DevotionContent({ devotion, accent = "hsl(var(--primary))", liked, onCopy, onShare, onLike }: Props) {
  const verseRef = devotion.bookName ? `${devotion.bookName} ${devotion.chapter}:${devotion.verseNumber}` : null;
  const wordStudies = parseList(devotion.wordStudies);
  const practicalApps = parseList(devotion.practicalApplications);
  const keyThemes = parseList(devotion.keyThemes);
  const crossRefs = parseList(devotion.crossReferences);
  const takeaways = parseList(devotion.takeaways);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{devotion.title}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" /> {fmtDate(devotion.displayDate, "long")}
        </div>
      </div>
      {verseRef && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-sm">
          <BookOpen className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium">{verseRef}</span>
          {devotion.bibleVersion && <span className="text-muted-foreground">&middot; {devotion.bibleVersion}</span>}
        </div>
      )}
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {devotion.content.split("\n").map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="flex items-center justify-center gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCopy} className="h-8 gap-1.5 text-xs"><Copy className="w-3.5 h-3.5" /> Copy</Button>
        <Button variant="outline" size="sm" onClick={onShare} className="h-8 gap-1.5 text-xs"><Share2 className="w-3.5 h-3.5" /> Share</Button>
        <Button variant={liked ? "default" : "outline"} size="sm" onClick={onLike} className={`h-8 gap-1.5 text-xs ${liked ? "text-rose-500" : ""}`}>
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} /> {liked ? "Liked" : "Like"}
        </Button>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      {devotion.explanation && <VerseSection label="Explanation" icon={Lightbulb} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{devotion.explanation}</p></VerseSection>}
      {devotion.application && <VerseSection label="Application" icon={ListChecks} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{devotion.application}</p></VerseSection>}
      {devotion.verseIntroduction && <VerseSection label="Verse Introduction" icon={ScrollText} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{devotion.verseIntroduction}</p></VerseSection>}
      <BackgroundSection author={devotion.backgroundAuthor} book={devotion.backgroundBook} context={devotion.backgroundContext} accent={accent} />
      {wordStudies.length > 0 && <VerseSection label="Strong Concordance Word Study" icon={GraduationCap} accent={accent}><WordStudyList items={wordStudies} accent={accent} /></VerseSection>}
      {practicalApps.length > 0 && <VerseSection label="Practical Applications" icon={ListChecks} accent={accent} count={practicalApps.length}><NumberedList items={practicalApps} accent={accent} /></VerseSection>}
      {(keyThemes.length > 0 || crossRefs.length > 0) && (
        <VerseSection label="Insights and Cross References" icon={Sparkles} accent={accent}>
          {keyThemes.length > 0 && <div className="space-y-2"><SubLabel label="Key Themes" accent={accent} /><BulletList items={keyThemes} accent={accent} /></div>}
          {crossRefs.length > 0 && <div className="space-y-2"><SubLabel label="Cross References" accent={accent} /><BulletList items={crossRefs} accent={accent} /></div>}
        </VerseSection>
      )}
      {devotion.finalThoughts && <VerseSection label="Final Thoughts" icon={BookMarked} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed">{devotion.finalThoughts}</p></VerseSection>}
      {takeaways.length > 0 && <VerseSection label="Takeaways" icon={Sparkles} accent={accent} count={takeaways.length}><NumberedList items={takeaways} accent={accent} /></VerseSection>}
      {devotion.learnMore && <VerseSection label="Learn More" icon={BookMarked} accent={accent}><p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{devotion.learnMore}</p></VerseSection>}
      <div className="text-center py-8"><p className="text-sm text-muted-foreground italic">Meditate on this word today. Let it guide your thoughts and actions.</p></div>
    </div>
  );
}
