// Live preview for verse explanations
import { Eye } from "lucide-react";

interface ExplanationPreviewProps {
  title: string;
  content: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
}
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>')
    .replace(/^(-|•)\s+(.+)$/gm, '<li class="ml-4 list-disc">$2</li>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n/g, "<br/>");
export function ExplanationPreview({ title, content, bookName, chapter, verseNumber }: ExplanationPreviewProps) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Preview</h3>
      </div>
      {bookName && (
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2">
          {bookName} {chapter}:{verseNumber}
        </p>
      )}
      {title && (
        <h4 className="text-base font-bold text-foreground mb-3">{title}</h4>
      {content ? (
        <div
          className="text-sm text-foreground/80 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      ) : (
        <p className="text-xs text-muted-foreground italic">Start typing to see a live preview...</p>
    </div>
  );
