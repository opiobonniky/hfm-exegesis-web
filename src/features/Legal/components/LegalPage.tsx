import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { LegalDocument } from "../content/legal";
import { LEGAL_LAST_UPDATED } from "../content/legal";

interface LegalPageProps {
  document: LegalDocument;
  title: string;
}

/**
 * Public legal page. The copy is intentionally English-only: a translation is
 * not authoritative, so the surrounding chrome is translated but the document
 * body is not.
 */
export default function LegalPage({ document, title }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated {LEGAL_LAST_UPDATED}
      </p>

      <div className="mt-10 space-y-8">
        {document.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-3 text-sm leading-7 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets?.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm leading-7 text-muted-foreground">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
