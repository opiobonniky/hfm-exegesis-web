import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

/**
 * Layout shell for the daily verse editor. The form takes the full content
 * width so its fields have room to breathe.
 */
export function AddDailyVerseWorkspace({ children }: Props) {
  return <div className="min-w-0">{children}</div>;
}
