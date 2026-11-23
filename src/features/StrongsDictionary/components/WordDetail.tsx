import { BookOpen, Hash, Languages, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ContextualStudy, StrongsWord } from "../hooks/useStrongsDictionaryPage";
import { tt } from '@/components/languages/hardcodedTranslate';
import { displayDigits } from '@/services/numberLocale/format';
import { routePaths } from "@/components/Routes/routes";
import { useBrowseWordDetails } from "../hooks/useBrowseWordDetails";

interface WordDetailProps {
  word: StrongsWord;
  isFavorited: boolean;
  onToggleFavorite: (word: StrongsWord) => void;
}

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm">{value}</p>
  </div>
);

function LinkedPassage({ reference }: { reference: NonNullable<ContextualStudy["reference"]> }) {
  const { bookName, chapter, verseNumber, verseEnd, bibleVersion } = reference;
  const query = new URLSearchParams({ book: bookName, chapter: String(chapter) });
  if (verseNumber != null) query.set("verse", String(verseNumber));
  const passage = `${bookName} ${chapter}${verseNumber == null ? "" : `:${verseNumber}`}${verseEnd ? `–${verseEnd}` : ""}`;
  return (
    <p className="text-xs font-bold text-primary">
      <Link className="underline underline-offset-4" to={`${routePaths.bibleReader}?${query}`}>
        {displayDigits(passage)}
      </Link>
      {bibleVersion && ` · ${bibleVersion}`}
    </p>
  );
}

export function WordDetail({ word: preview, isFavorited, onToggleFavorite }: WordDetailProps) {
  const detail = useBrowseWordDetails(preview);
  const word = detail.word ?? preview;
  const studies = word.contextualStudies || [];
  const studyCount = word.contextualStudyCount ?? studies.length;
  const hasDictionary = word.hasDictionaryEntry !== false;
  return (
    <Card className="overflow-hidden border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.12] via-card to-accent/[0.08] p-5 sm:p-6">
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge className="gap-1 bg-primary text-primary-foreground">
                <Hash className="h-3 w-3" /> {word.strongsNumber}
              </Badge>
              <Badge variant="secondary" className="gap-1 capitalize">
                <Languages className="h-3 w-3" /> {word.language}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight sm:text-4xl">
              {word.hebrewWord || studies[0]?.surfaceTextGloss || studies[0]?.surfaceText || word.strongsNumber}
            </CardTitle>
            {word.transliteration && (
              <p className="mt-2 text-sm italic text-muted-foreground">{word.transliteration}</p>
            )}
          </div>
          <Button variant="secondary" size="icon" onClick={() => onToggleFavorite(word)} aria-label={tt("Save word")}>
            <Star className={cn("h-5 w-5", isFavorited ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          {hasDictionary && <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tt("Occurrences")}</p>
            <p className="mt-1 text-xl font-black">{word.kjvOccurrences}</p>
          </div>}
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tt("Verse studies")}</p>
            <p className="mt-1 text-xl font-black">{displayDigits(studyCount)}</p>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><BookOpen className="h-4 w-4" /></div>
            <h3 className="font-bold">{tt("Dictionary definition")}</h3>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
            <p className="text-sm leading-7">{hasDictionary
              ? word.strongsDef || word.meaning || tt("No definition available.")
              : tt("No dictionary entry is available for this word. The verse studies below explain its meaning in context.")}</p>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          {word.pronunciation && <DetailField label={tt("Pronunciation")} value={word.pronunciation} />}
          {word.bdbEntry && <DetailField label={tt("Additional note")} value={word.bdbEntry} />}
        </div>

        {studies.length > 0 ? (
          <section className="space-y-3 border-t pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">{tt("Meaning in context")}</p>
                <h3 className="mt-1 text-lg font-black">{tt("Verse word studies")}</h3>
              </div>
              <Badge variant="outline">{displayDigits(studyCount)}</Badge>
            </div>
            <div className="space-y-3">
              {studies.map((study, index) => (
                <article key={`${study.reference?.bookName || "study"}-${index}`} className="rounded-2xl border bg-card p-4 shadow-sm">
                {study.reference && <LinkedPassage reference={study.reference} />}
                {(study.surfaceTextGloss || study.surfaceText) && <p className="mt-2 font-semibold">{study.surfaceTextGloss || study.surfaceText}</p>}
                {study.customDefinition && <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{study.customDefinition}</p>}
                {!!study.themes?.length && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {study.themes.map((theme) => <Badge key={theme} variant="secondary">{theme}</Badge>)}
                  </div>
                )}
                </article>
              ))}
            </div>
          </section>
        ) : !detail.loading && <p className="text-sm text-muted-foreground">{tt("No linked verse studies yet.")}</p>}
        {detail.loading && <p role="status" className="text-sm text-muted-foreground">{tt("Loading word study…")}</p>}
        {!detail.loading && (detail.failed || detail.word?.nextStudyOffset != null) && (
          <Button variant="outline" onClick={() => detail.load(detail.word?.nextStudyOffset ?? 0)}>
            {detail.failed ? tt("Retry") : tt("Load More")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
