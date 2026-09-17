import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { WordDetail } from "./WordDetail";
import type { StrongsDictionaryPageData } from "../hooks/useStrongsDictionaryPage";

interface StrongsSelectionPanelProps {
  selectedWord: StrongsDictionaryPageData["selectedWord"];
  isFavorited: StrongsDictionaryPageData["isFavorited"];
  onToggleFavorite: StrongsDictionaryPageData["toggleFavorite"];
  onClose: () => void;
}

export function StrongsSelectionPanel({
  selectedWord,
  isFavorited,
  onToggleFavorite,
  onClose,
}: StrongsSelectionPanelProps) {
  const detail = selectedWord ? (
    <WordDetail
      word={selectedWord}
      isFavorited={isFavorited(selectedWord.strongsNumber)}
      onToggleFavorite={onToggleFavorite}
    />
  ) : null;

  return (
    <>
      {!selectedWord && (
        <Card className="hidden border-dashed bg-card/70 xl:block">
          <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-primary/50" />
            <h2 className="font-semibold">Select a word to study</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Choose a Strong&apos;s entry to view definitions, verse studies, and related themes.
            </p>
          </CardContent>
        </Card>
      )}

      <Sheet open={Boolean(selectedWord)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <SheetTitle>Word study</SheetTitle>
          </SheetHeader>
          <div className="p-4">{detail}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
