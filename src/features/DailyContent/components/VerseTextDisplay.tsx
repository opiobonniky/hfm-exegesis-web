/**
 * VerseTextDisplay — styled verse text card for detail pages.
 */
interface VerseTextDisplayProps {
  label?: string;
  text: string;
}

export function VerseTextDisplay({ label = "Verse Text", text }: VerseTextDisplayProps) {
  return (
    <div className="rounded-xl bg-primary/5 border border-primary/10 px-5 py-4">
      <p className="text-sm font-semibold text-primary mb-1">{label}</p>
      <p className="text-base italic text-foreground/90 leading-relaxed font-serif">"{text}"</p>
    </div>
  );
}
