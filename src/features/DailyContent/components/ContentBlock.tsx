/**
 * ContentBlock — labeled content display for detail pages (e.g., "Content", "Teaching Body").
 */
import { LucideIcon } from "lucide-react";

interface ContentBlockProps {
  label: string;
  text: string;
  icon?: LucideIcon;
}

export function ContentBlock({ label, text, icon: Icon }: ContentBlockProps) {
  return (
    <div className="py-4">
      <p className="text-sm font-semibold text-primary mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{text}</p>
    </div>
  );
}
