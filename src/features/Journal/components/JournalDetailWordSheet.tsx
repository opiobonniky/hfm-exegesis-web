import { WordDetailSheet } from "@/components/WordDetailSheet";
import type { JournalDetailSelectedWord } from "../types";

export interface JournalDetailWordSheetProps {
  open: boolean;
  selectedWord: JournalDetailSelectedWord | null;
  onOpenChange: (open: boolean) => void;
}

export default function JournalDetailWordSheet({ open, selectedWord, onOpenChange }: JournalDetailWordSheetProps) {
  return (
    <WordDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      strongsId={selectedWord?.strongsId || null}
      surfaceText={selectedWord?.surfaceText}
    />
  );
}
