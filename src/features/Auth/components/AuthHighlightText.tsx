/**
 * AuthHighlightText — highlighted text in branded panels.
 * Replaces raw <span className="text-primary"> in pages.
 */
interface AuthHighlightTextProps {
  text: string;
}

export function AuthHighlightText({ text }: AuthHighlightTextProps) {
  return <span className="text-primary">{text}</span>;
}
