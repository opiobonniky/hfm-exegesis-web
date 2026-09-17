/**
 * AuthHighlightText — highlighted text in branded panels.
 * Replaces raw <span className="text-primary"> in pages.
 */
interface AuthHighlightTextProps {
  text: string;
  children?: React.ReactNode;
}

export function AuthHighlightText({ text, children }: AuthHighlightTextProps) {
  return (
    <span className="text-primary flex items-center gap-1">
      {children}
      {text}
    </span>
  );
}
