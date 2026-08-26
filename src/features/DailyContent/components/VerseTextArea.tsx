// VerseTextArea — editable verse text with version indicator + loading state
import { Pencil, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";

interface Props {
  verseText: string;
  setVerseText: (v: string) => void;
  isVerseEditing: boolean;
  setIsVerseEditing: (v: boolean) => void;
  isVerseLoading: boolean;
  book: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  t: any;
}
export function VerseTextArea(p: Props) {
  const versionAbbr = BIBLE_VERSIONS.find((v) => v.id === p.bibleVersion)?.abbreviation || p.bibleVersion;
  return (
    <div className="space-y-2">
      <Label className="flex items-center justify-between">
        <span>
          {p.t.dailyVerse.verseText}{" "}
          <span className="text-xs text-muted-foreground ml-1">
            {p.isVerseEditing ? p.t.dailyVerse.editedLabel : p.t.dailyVerse.readOnlyLabel}
          </span>
          {p.bibleVersion && (
            <span className="text-xs text-primary font-medium ml-2">• {versionAbbr}</span>
          )}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => p.setIsVerseEditing(!p.isVerseEditing)}
        >
          <Pencil className="h-3 w-3 mr-1" />
          {p.isVerseEditing ? "Done" : "Edit"}
        </Button>
      </Label>
      <div className="relative">
        {p.isVerseLoading ? (
          <div className="min-h-[110px] flex items-center justify-center border rounded-md bg-muted/30">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Textarea
            value={p.verseText}
            onChange={(e) => p.setVerseText(e.target.value)}
            readOnly={!p.isVerseEditing}
            className="min-h-[110px] resize-none font-serif leading-relaxed"
            placeholder={p.isVerseEditing ? "Edit verse text..." : "Select a verse to see its text..."}
          />
        )}
        {p.book && p.chapter && p.verseNumber && (
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {p.t.dailyVerse.refPrefix} {p.book} {p.chapter}:{p.verseNumber} ({versionAbbr})
          </div>
        )}
      </div>
    </div>
  );
}
