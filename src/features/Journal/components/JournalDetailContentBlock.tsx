export interface JournalDetailContentBlockProps {
  content: string | null;
}

export default function JournalDetailContentBlock({ content }: JournalDetailContentBlockProps) {
  if (!content) return null;
  return <div className="mb-6 text-sm sm:text-base leading-[1.8] text-foreground/80 dark:text-muted-foreground/50 whitespace-pre-line font-serif">{content}</div>;
}
