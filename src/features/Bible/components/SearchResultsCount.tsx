import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from '@/components/languages/languageProvider';
import { displayDigits } from '@/services/numberLocale/format';
/**
 * SearchResultsCount — displays the number of search results.
 */
interface SearchResultsCountProps {
  total: number;
}

export function SearchResultsCount({ total }: SearchResultsCountProps) {
  const { lang } = useLanguage();
  return (
    <div className="px-4 sm:px-6 py-2 mb-2">
      <p className="text-xs font-semibold text-muted-foreground">{displayDigits(total, lang)}{tt("result")}{total !== 1 ? "s" : ""}</p>
    </div>
  );
}
