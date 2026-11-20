import { tt } from '@/components/languages/hardcodedTranslate';
interface RequiredContentFieldsProps {
  explanation: string;
  setExplanation: (v: string) => void;
  application: string;
  setApplication: (v: string) => void;
  isRtl: boolean;
  errors?: Partial<Record<'explanation' | 'application', string>>;
}

export function RequiredContentFields({
  explanation,
  setExplanation,
  application,
  setApplication,
  isRtl,
  errors,
}: RequiredContentFieldsProps) {
  const field = (key: keyof NonNullable<RequiredContentFieldsProps['errors']>) => ({
    id: `daily-verse-${key}`,
    'data-validation-field': key,
    'aria-invalid': !!errors?.[key],
    'aria-describedby': errors?.[key] ? `daily-verse-${key}-error` : undefined,
  });
  const error = (key: keyof NonNullable<RequiredContentFieldsProps['errors']>) => errors?.[key] &&
    <p id={`daily-verse-${key}-error`} role="status" className="text-xs text-destructive">{tt(errors[key]!)}</p>;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-5">
        <label htmlFor="daily-verse-explanation" className="mb-2 block text-sm font-semibold">{tt("Explanation *")}</label>
        <textarea
          {...field('explanation')}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={tt("Explain the heart of this verse...")}
          rows={10}
          className="min-h-[240px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
        {error('explanation')}
      </div>
      <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
        <label htmlFor="daily-verse-application" className="mb-2 block text-sm font-semibold">{tt("Application *")}</label>
        <textarea
          {...field('application')}
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          placeholder={tt("How should readers apply this to daily life?")}
          rows={7}
          className="min-h-[170px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
        {error('application')}
      </div>
    </div>
  );
}

export function VerseIntroductionField({ value, onChange, error, isRtl }: {
  value: string; onChange: (value: string) => void; error?: string; isRtl: boolean;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
      <label htmlFor="daily-verse-introduction" className="block text-sm font-semibold">{tt("Verse Introduction *")}</label>
      <textarea
        id="daily-verse-introduction"
        data-validation-field="verseIntroduction"
        aria-invalid={!!error}
        aria-describedby={error ? 'daily-verse-introduction-error' : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={tt("Introduce the verse and its central purpose...")}
        rows={6}
        className="min-h-[140px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-ring"
        dir={isRtl ? "rtl" : "ltr"}
      />
      {error && <p id="daily-verse-introduction-error" role="status" className="text-xs text-destructive">{tt(error)}</p>}
    </div>
  );
}
