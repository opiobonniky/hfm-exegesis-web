interface RequiredContentFieldsProps {
  explanation: string;
  setExplanation: (v: string) => void;
  application: string;
  setApplication: (v: string) => void;
  verseIntroduction: string;
  setVerseIntroduction: (v: string) => void;
  learnMore: string;
  setLearnMore: (v: string) => void;
  t: any;
  isRtl: boolean;
}

export function RequiredContentFields({
  explanation,
  setExplanation,
  application,
  setApplication,
  verseIntroduction,
  setVerseIntroduction,
  learnMore,
  setLearnMore,
  t,
  isRtl,
}: RequiredContentFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-5">
        <label className="mb-2 block text-sm font-semibold">
          Explanation *
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain the heart of this verse..."
          rows={10}
          className="min-h-[240px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
        <label className="mb-2 block text-sm font-semibold">
          Application *
        </label>
        <textarea
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          placeholder="How should readers apply this to daily life?"
          rows={7}
          className="min-h-[170px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
        <label className="mb-2 block text-sm font-semibold">
          Verse Introduction *
        </label>
        <textarea
          value={verseIntroduction}
          onChange={(e) => setVerseIntroduction(e.target.value)}
          placeholder="Introduce the verse and its central purpose..."
          rows={6}
          className="min-h-[140px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
        <label className="mb-2 block text-sm font-semibold">Learn More</label>
        <textarea
          value={learnMore}
          onChange={(e) => setLearnMore(e.target.value)}
          placeholder="Additional resources, related verses, or deeper insights..."
          rows={5}
          className="min-h-[120px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
    </div>
  );
}
