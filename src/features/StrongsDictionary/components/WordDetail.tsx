import { Star } from "lucide-react";
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
  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">{word.hebrewWord}</span>
            <Badge variant="outline" className="font-mono">{word.strongsNumber}</Badge>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onToggleFavorite(word)}>
            <Star className={cn("h-5 w-5", isFavorited ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailField label="Transliteration" value={<span className="italic">{word.transliteration}</span>} />
        <DetailField label="Pronunciation" value={word.pronunciation} />
        <DetailField label="Strong's Definition" value={word.strongsDef} />
        <DetailField label="KJV Occurrences" value={word.kjvOccurrences} />
        {word.bdbEntry && <DetailField label="BDB Entry" value={word.bdbEntry} />}
      </CardContent>
    </Card>
  );
}
