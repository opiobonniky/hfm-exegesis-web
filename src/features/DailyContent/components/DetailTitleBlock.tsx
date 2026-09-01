/**
 * DetailTitleBlock — title + meta for detail pages.
 */
import { ReactNode } from "react";

interface DetailTitleBlockProps {
  title: string;
  children?: ReactNode;
}

export function DetailTitleBlock({ title, children }: DetailTitleBlockProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}
