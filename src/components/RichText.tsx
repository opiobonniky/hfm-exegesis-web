import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * RichText — renders the AI template engine's rich answer format.
 *
 * The backend answers now use lightweight markers:
 *   ## Section headings      ### Sub-headings
 *   **bold lead-ins**        *italic quoted phrases*
 *   • bullet list items      1. numbered list items
 *   \n line breaks           \n\n paragraph breaks
 *
 * Instead of dumping raw `**`/`##` markers into plain text, this component
 * parses them into real React elements. It never uses
 * dangerouslySetInnerHTML — every token becomes a plain string child, so
 * AI-generated content is rendered XSS-safely.
 */
interface RichTextProps {
  text: string;
  className?: string;
}

/** Render one line, splitting out **bold** and *italic* tokens. */
function renderInline(line: string, keyPrefix: string): ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export default function RichText({ text, className }: RichTextProps) {
  const content = String(text ?? "").trim();
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let keyCounter = 0;
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length === 0) return;
    const pKey = keyCounter++;
    nodes.push(
      <p key={`p-${pKey}`}>
        {para.map((line, i) => (
          <Fragment key={`${pKey}-${i}`}>
            {i > 0 && <br />}
            {renderInline(line, `${pKey}-${i}`)}
          </Fragment>
        ))}
      </p>,
    );
    para = [];
  };

  const flushList = () => {
    if (!list) return;
    const lKey = keyCounter++;
    const ListTag = list.type;
    nodes.push(
      <ListTag
        key={`l-${lKey}`}
        className={cn("pl-5", list.type === "ul" ? "list-disc" : "list-decimal")}
      >
        {list.items.map((item, i) => (
          <li key={`${lKey}-${i}`} className="leading-relaxed">
            {renderInline(item, `${lKey}-${i}`)}
          </li>
        ))}
      </ListTag>,
    );
    list = null;
  };

  const flushAll = () => {
    flushList();
    flushPara();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Heading: "## Introduction"
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushAll();
      const hKey = keyCounter++;
      const level = heading[1].length;
      const HeadingTag = level === 1 ? "h4" : level === 2 ? "h5" : "h6";
      nodes.push(
        <HeadingTag
          key={`h-${hKey}`}
          className="mt-3 mb-1.5 text-sm font-bold tracking-tight text-foreground first:mt-0"
        >
          {renderInline(heading[2], `h-${hKey}`)}
        </HeadingTag>,
      );
      continue;
    }

    // Bullet item: "• text" or "- text"
    const bullet = trimmed.match(/^[•\-\u2022]\s+(.+)$/);
    if (bullet) {
      flushPara();
      if (list?.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    // Numbered item: "1. text"
    const numbered = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numbered) {
      flushPara();
      if (list?.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(numbered[2]);
      continue;
    }

    // Blank line closes lists and separates paragraphs
    if (trimmed === "") {
      flushAll();
      continue;
    }

    // Regular text line
    flushList();
    para.push(line);
  }
  flushAll();

  return <div className={cn("space-y-2", className)}>{nodes}</div>;
}
