// TranslationComparisonAccordion — the same verse in the Bible
// translations of the reader's own language.
//
// The comparison is scoped to the app language: it only makes sense to
// compare renderings of the same language. English has several versions
// (KJV, BSB, ASV, …) and most other languages have one.
//
// The versions live behind a single accordion that opens by default, so they
// are visible side by side rather than one tap at a time. A language with a
// single version has nothing to compare, so the verse is shown straight away.
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { TranslationComparisonEntry } from "@/services/verseResourcesApi";

interface Props {
  translations: TranslationComparisonEntry[] | null;
}

export default function TranslationComparisonAccordion({ translations }: Props) {
  const { lang } = useLanguage();

  // The backend scopes the comparison to the reader's language, but the
  // entries are filtered here too: a stale cache from another language must
  // not leak into the list.
  const versions = useMemo(
    () =>
      (translations ?? []).filter(
        (entry) => !entry.language || entry.language === lang,
      ),
    [translations, lang],
  );

  // The group opens by default: the reader opened the comparison, so the
  // versions are what they came for.
  const [open, setOpen] = useState(true);

  if (versions.length === 0) return null;

  const renderVerse = (entry: TranslationComparisonEntry, key: string) => (
    <div key={key} className="p-3 rounded-lg bg-muted/20 border border-border/30">
      <p className="text-[10px] font-bold text-primary mb-1">{entry.version}</p>
      <p className="text-sm text-foreground/80 italic leading-relaxed">
        &ldquo;{entry.text}&rdquo;
      </p>
    </div>
  );

  // A single version is the only one there is, so there is nothing to
  // compare and nothing to open.
  if (versions.length === 1) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {tt("Translation Comparison")}
        </p>
        {renderVerse(versions[0], String(versions[0].id ?? 0))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors text-left"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {tt("Translation Versions")}
          </span>
          <span className="block text-[10px] text-muted-foreground mt-0.5">
            {tt("{count} versions").replace("{count}", String(versions.length))}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="space-y-2">
          {versions.map((entry, index) =>
            renderVerse(entry, String(entry.id ?? index)),
          )}
        </div>
      ) : null}
    </div>
  );
}
