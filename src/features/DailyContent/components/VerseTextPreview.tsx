/**
 * VerseTextPreview — read-only verse text display with reference badge.
 */
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VerseTextPreviewProps {
  verseText: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseTextLabel?: string;
  verseTextHint?: string;
}

export function VerseTextPreview({
  verseText,
  bookName,
  chapter,
  verseNumber,
  verseTextLabel = "Verse Text",
  verseTextHint,
}: VerseTextPreviewProps) {
  return (
    <div className="space-y-2">
      <Label>
        {verseTextLabel}
        {verseTextHint && <span className="text-xs text-muted-foreground font-normal ml-1">{verseTextHint}</span>}
      </Label>
      <div className="relative">
        <Textarea
          value={verseText}
          readOnly
          className="min-h-[110px] resize-none bg-muted/40 font-serif leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
          {bookName} {chapter}:{verseNumber}
        </div>
      </div>
    </div>
  );
}
