import { BookOpen, Hash, Languages, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StrongsWord } from "../hooks/useStrongsDictionaryPage";

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

export function WordDetail({ word, isFavorited, onToggleFavorite }: WordDetailProps) {
  const studies = word.contextualStudies || [];
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
              {word.hebrewWord || "Unnamed word"}
            </CardTitle>
            {word.transliteration && (
              <p className="mt-2 text-sm italic text-muted-foreground">{word.transliteration}</p>
            )}
          </div>
          <Button variant="secondary" size="icon" onClick={() => onToggleFavorite(word)} aria-label="Save word">
            <Star className={cn("h-5 w-5", isFavorited ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Occurrences</p>
            <p className="mt-1 text-xl font-black">{word.kjvOccurrences}</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verse studies</p>
            <p className="mt-1 text-xl font-black">{studies.length}</p>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><BookOpen className="h-4 w-4" /></div>
            <h3 className="font-bold">Core definition</h3>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
            <p className="text-sm leading-7">{word.strongsDef || word.meaning || "No definition available."}</p>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          {word.pronunciation && <DetailField label="Pronunciation" value={word.pronunciation} />}
          {word.bdbEntry && <DetailField label="Additional note" value={word.bdbEntry} />}
        </div>

        {studies.length > 0 && (
          <section className="space-y-3 border-t pt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">From the study library</p>
                <h3 className="mt-1 text-lg font-black">Verse word studies</h3>
              </div>
              <Badge variant="outline">{studies.length} found</Badge>
            </div>
            <div className="space-y-3">
              {studies.map((study, index) => (
                <article key={`${study.reference?.bookName || "study"}-${index}`} className="rounded-2xl border bg-card p-4 shadow-sm">
                {study.reference && (
                  <p className="text-xs font-bold text-primary">
                    {study.reference.bookName} {study.reference.chapter}:{study.reference.verseNumber}
                    {study.reference.bibleVersion ? ` · ${study.reference.bibleVersion}` : ""}
                  </p>
                )}
                {study.surfaceText && <p className="mt-2 font-semibold">{study.surfaceText}</p>}
                {study.customDefinition && <p className="mt-2 text-sm leading-7 text-muted-foreground">{study.customDefinition}</p>}
                {study.themes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {study.themes.map((theme) => <Badge key={theme} variant="secondary">{theme}</Badge>)}
                  </div>
                )}
                </article>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
