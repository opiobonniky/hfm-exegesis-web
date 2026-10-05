import { cn } from "@/lib/utils";

/**
 * AuthHighlightText — highlighted text in branded panels.
 * Replaces raw <span className="text-primary"> in pages.
 */
interface AuthHighlightTextProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
}

export function AuthHighlightText({ text, children, className }: AuthHighlightTextProps) {
  return (
    <span className={cn("text-primary flex items-center gap-1", className)}>
      {children}
      {text}
    </span>
  );
}
