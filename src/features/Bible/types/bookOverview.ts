// BookOverview feature types
export interface BookOverviewState {
  bookName: string;
  prologue: BookPrologue | null;
  loading: boolean;
  resumeChapter: number | null;
  resumeVerse: number | null;
  isOt: boolean;
  designation: string | null;
  testamentLabel: string;
  onStartReading: () => void;
  onBack: () => void;
}

/** Minimal re-export — full type lives in services/bookProloguesApi */
import type { BookPrologue } from "@/services/bookProloguesApi";
export type { BookPrologue };
