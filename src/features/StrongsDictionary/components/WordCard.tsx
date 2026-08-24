import { Star } from "lucide-react";
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
      className={cn("transition-shadow hover:shadow-md cursor-pointer", isSelected && "ring-2 ring-primary")}
      onClick={() => onSelect(word)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs font-mono">{word.strongsNumber}</Badge>
              <Badge variant={word.language === "hebrew" ? "default" : "secondary"} className="text-xs">
                {word.language === "hebrew" ? "Hebrew" : "Greek"}
              </Badge>
            </div>
            <p className="text-lg font-semibold">{word.hebrewWord}</p>
            <p className="text-sm text-muted-foreground italic">
              {word.transliteration}{word.pronunciation && ` (${word.pronunciation})`}
            </p>
            <p className="text-sm mt-1 line-clamp-2">{word.meaning}</p>
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
