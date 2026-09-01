/**
 * BibleBookList — list of BookCard components with spacing.
 */
import { ReactNode } from "react";

interface BibleBookListProps {
  children: ReactNode;
}

export function BibleBookList({ children }: BibleBookListProps) {
  return <div className="space-y-2">{children}</div>;
}
