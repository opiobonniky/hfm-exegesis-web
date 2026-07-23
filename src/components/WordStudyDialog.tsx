import { useState, useEffect, useCallback } from "react";
import { BookText, Info, Loader2, Search, Languages, Hash, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStrongsEntry } from "@/services/strongsApi";
import type { StrongsEntry } from "@/services/strongsApi";
import { cn } from "@/lib/utils";

// ── Types ──

interface WordStudyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strongsId: string | null;
  surfaceText?: string;
  verseRef?: string;
}

// ── Component ──

export default function WordStudyDialog({
  open,
  onOpenChange,
  strongsId,
  surfaceText,
  verseRef,
}: WordStudyDialogProps) {
  const [entry, setEntry] = useState<StrongsEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !strongsId) return;

    let cancelled = false;
    setLoading(true);
    setError(false);
    setEntry(null);

    getStrongsEntry(strongsId)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setEntry(result);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, strongsId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookText className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground">
              {entry?.originalWord || surfaceText || "Word Study"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {surfaceText && (
              <span className="text-xs font-semibold text-muted-foreground">
                {verseRef && `${verseRef} · `}
                {surfaceText}
                {entry?.transliteration && ` — ${entry.transliteration}`}
              </span>
            )}
            {!surfaceText && verseRef && (
              <span className="text-xs text-muted-foreground">{verseRef}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Could not load word details for{" "}
                <span className="font-semibold">{surfaceText || strongsId}</span>.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (strongsId) {
                    setLoading(true);
                    setError(false);
                    getStrongsEntry(strongsId)
                      .then((r) => {
                        setEntry(r);
                        setLoading(false);
                      })
                      .catch(() => {
                        setError(true);
                        setLoading(false);
                      });
                  }
                }}
                className="mt-2 gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Retry
              </Button>
            </div>
          ) : entry ? (
            <>
              {/* Language badge and transliteration row */}
              <div className="flex items-center gap-2 flex-wrap">
                {entry.language && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold gap-1"
                  >
                    <Languages className="w-3 h-3" />
                    {entry.language === "greek" ? "Greek" : entry.language === "hebrew" ? "Hebrew" : entry.language}
                  </Badge>
                )}
                {entry.transliteration && (
                  <span className="text-sm italic font-semibold text-foreground">
                    {entry.transliteration}
                  </span>
                )}
              </div>

              {/* Plain-English Explanation */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  What It Means
                </p>
                <p className="text-sm font-medium text-foreground leading-6">
                  {entry.shortDefinition}
                </p>
              </div>

              {/* Full Definition */}
              {entry.fullDefinition && (
                <div className="rounded-lg bg-card border border-border p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    More Detail
                  </p>
                  <p className="text-sm text-foreground leading-6">
                    {entry.fullDefinition}
                  </p>
                </div>
              )}

              {/* Usage count */}
              {entry.usageCount != null && (
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Used <strong>{entry.usageCount}×</strong> in Scripture
                  </span>
                </div>
              )}

              {/* Grammar in plain English */}
              {(entry.partOfSpeech || entry.grammaticalCase || entry.gender || entry.number) && (
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Info className="w-3 h-3" />
                    Grammar (Plain English)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.partOfSpeech && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        {entry.partOfSpeech}
                      </Badge>
                    )}
                    {entry.grammaticalCase && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                        {entry.grammaticalCase} case
                      </Badge>
                    )}
                    {entry.gender && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                        {entry.gender}
                      </Badge>
                    )}
                    {entry.number && (
                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                        {entry.number}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Cross References */}
              {entry.crossReferences && (
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Cross References
                  </p>
                  <p className="text-xs text-foreground/80 leading-5">
                    {entry.crossReferences}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
