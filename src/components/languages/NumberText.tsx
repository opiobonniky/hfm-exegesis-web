import { useLanguage } from './languageProvider';
import { displayNumber, displayUiText } from '@/services/numberLocale/format';

/**
 * Display-only number. Never use for form values, identifiers, API payloads,
 * navigation parameters, totals sent to checkout, or stored text.
 */
export function LocalizedNumber({
  value,
  options,
  className,
}: {
  value: number;
  options?: Intl.NumberFormatOptions;
  className?: string;
}) {
  const { lang } = useLanguage();
  return <span className={className}>{displayNumber(value, lang, options)}</span>;
}

/** Localizes numerals in already-resolved UI copy (references, counters, labels). */
export function LocalizedText({
  children,
  className,
}: {
  children: string | number;
  className?: string;
}) {
  const { lang } = useLanguage();
  return <span className={className}>{displayUiText(children, lang)}</span>;
}
