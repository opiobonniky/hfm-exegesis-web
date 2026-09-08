import { ArrowRight, BookOpen, Languages, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StrongsWord } from "../hooks/useStrongsDictionaryPage";

interface WordCardProps {
  word: StrongsWord;
  isSelected: boolean;
  isFavorited: boolean;
  onSelect: (word: StrongsWord) => void;
  onToggleFavorite: (word: StrongsWord) => void;
}

export function WordCard({ word, isSelected, isFavorited, onSelect, onToggleFavorite }: WordCardProps) {
  return (
    <Card
      className={cn("group cursor-pointer border-border/70 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg", isSelected && "border-primary/50 ring-2 ring-primary/20 shadow-md")}
      onClick={() => onSelect(word)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(word);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open study details for ${word.strongsNumber}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-2">
              <Badge className="font-mono text-xs">{word.strongsNumber}</Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {word.language === "hebrew" ? "Hebrew" : "Greek"}
              </Badge>
            </div>
            <p className="text-xl font-black tracking-tight">{word.hebrewWord || "Unnamed word"}</p>
            <p className="text-sm text-muted-foreground italic">
              {word.transliteration}{word.pronunciation && ` (${word.pronunciation})`}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{word.meaning || "No short definition available."}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                <Languages className="h-3 w-3" /> {word.language}
              </span>
              {word.kjvOccurrences > 0 && (
                <span className="rounded-full bg-muted px-2 py-1">{word.kjvOccurrences} occurrences</span>
              )}
            </div>
            {word.contextualStudies && word.contextualStudies.length > 0 && (
              <div className="mt-3 space-y-1.5 text-xs font-semibold text-primary">
                <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {word.contextualStudies.length} verse {word.contextualStudies.length === 1 ? "study" : "studies"} available
                </div>
                <p className="line-clamp-2 font-normal text-muted-foreground">
                  {word.contextualStudies[0].customDefinition || word.contextualStudies[0].surfaceText}
                </p>
              </div>
            )}
            <Button
              type="button"
              variant="link"
              className="mt-2 h-auto gap-1 p-0 text-xs font-bold text-primary"
              onClick={(event) => {
                event.stopPropagation();
                onSelect(word);
              }}
            >
              Open word study <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(word); }}
          >
            <Star className={cn("h-4 w-4", isFavorited ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
