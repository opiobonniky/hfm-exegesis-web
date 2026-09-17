// ─────────────────────────────────────────────────────────────────────────────
// studyPdf.ts — Shared print-window PDF builder for the Exegesis Lab.
// Both LabFlow (live study) and LabReview (saved session) render the same
// styled print document from this single source of truth, so the template,
// CSS, escaping, and look-note formatting stay in sync.
// ─────────────────────────────────────────────────────────────────────────────

/** HTML-escape user content to prevent XSS in the print window. */
export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escape content and convert newlines to <br/> tags. */
export function nl2br(s: string): string {
  return esc(s).replace(/\n/g, "<br/>");
}

/** Render a section heading (escaped) with the accent-bar style. */
export function sectionHeading(text: string): string {
  return `<h2>${esc(text)}</h2>`;
}

/**
 * Wrap section body HTML. Defaults to the `.section content` styling; pass an
 * explicit className for custom variants (e.g. "content strongs"), or "" for
 * a bare `.section` wrapper (e.g. tag pills).
 */
export function sectionBody(innerHtml: string, className = "content"): string {
  const cls = className ? `section ${className}` : "section";
  return `<div class="${cls}">${innerHtml}</div>`;
}

/**
 * Format Look-stage observations: the saved notes are JSON keyed by prompt
 * index (e.g. {"0": "...", "2": "..."}). Each non-empty entry renders as a
 * Q&A card headed by the actual question text. Non-JSON notes fall back to a
 * plain-text entry.
 */
export function formatLookEntries(raw: string, lookPrompts: string[]): string {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const entries = Object.entries(parsed).filter(([, v]) => (v as string).trim());
      if (entries.length === 0) return "";
      return entries
        .map(([key, val]) => {
          const idx = Number(key);
          const question = lookPrompts[idx] || `Question ${idx + 1}`;
          return `<div class="entry"><p class="prompt">${esc(question)}</p><p class="answer">${esc(val as string)}</p></div>`;
        })
        .join("\n");
    }
  } catch {
    // Not JSON — fall through to plain-text entry.
  }
  return `<div class="entry"><p class="answer">${nl2br(raw)}</p></div>`;
}

/** Render a list of tags as pill spans (escaped). */
export function formatTags(tags: string[]): string {
  return tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ");
}

/** The print stylesheet shared by every Exegesis Lab PDF. */
export const STUDY_PDF_CSS = `
    @page { margin: 1.6cm; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1f2937;
      max-width: 720px;
      margin: 0 auto;
      padding: 24px 20px;
    }
    h1 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 24pt;
      font-weight: 700;
      color: #111827;
      text-align: center;
      margin: 0 0 6px;
      letter-spacing: -0.5px;
    }
    .subtitle { text-align: center; font-size: 10pt; color: #6b7280; margin-bottom: 22px; padding-bottom: 18px; border-bottom: 3px solid #e5e7eb; }
    h2 {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 14pt;
      font-weight: 700;
      color: #111827;
      margin: 24px 0 12px;
      padding: 6px 0 6px 12px;
      border-left: 4px solid #2563eb;
      background: #f8fafc;
      border-radius: 0 8px 8px 0;
    }
    .section { margin-bottom: 12px; }
    .content { font-size: 11pt; color: #374151; line-height: 1.75; white-space: pre-line; }
    .entry {
      break-inside: avoid;
      margin-bottom: 12px;
      padding: 10px 14px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-left: 3px solid #d1d5db;
      border-radius: 8px;
    }
    .prompt { font-size: 9.5pt; font-weight: 700; color: #2563eb; margin: 0 0 6px; }
    .answer { font-size: 11pt; color: #374151; margin: 0; white-space: pre-line; line-height: 1.7; }
    .strongs { padding-left: 14px; }
    .tag {
      display: inline-block;
      font-size: 9pt;
      color: #4b5563;
      background: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 999px;
      padding: 2px 10px;
      margin: 2px 4px 2px 0;
    }
    .footer { margin-top: 32px; text-align: center; font-size: 9pt; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 0; } }
  `;

/** Build the complete printable HTML document for a study. */
export function buildStudyPdfHtml(opts: {
  title: string;
  sections: string;
  dateStr?: string;
}): string {
  const date =
    opts.dateStr ||
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dateEsc = esc(date);
  const titleEsc = esc(opts.title);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bible Study: ${titleEsc}</title>
  <style>${STUDY_PDF_CSS}</style>
</head>
<body>
  <h1>📖 Bible Study: ${titleEsc}</h1>
  <p class="subtitle">Created with Exegesis Bible App · ${dateEsc}</p>

  ${opts.sections}

  <div class="footer">Created with Exegesis Bible App · ${dateEsc}</div>

  <script>
    window.onload = function() { window.print(); };
    window.onafterprint = function() { window.close(); };
    setTimeout(function() { window.close(); }, 30000);
  <\/script>
</body>
</html>`;
}

/** Open a print window with the given HTML and trigger the print dialog. */
export function openPrintWindow(html: string): void {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/** Build and print a study PDF document in one call. */
export function printStudyPdf(opts: { title: string; sections: string }): void {
  openPrintWindow(buildStudyPdfHtml(opts));
}
