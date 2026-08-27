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
  explanation, setExplanation,
  application, setApplication,
  verseIntroduction, setVerseIntroduction,
  learnMore, setLearnMore,
  t, isRtl,
}: RequiredContentFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Explanation *</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain the heart of this verse..."
          className="w-full min-h-[120px] rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Application *</label>
        <textarea
          value={application}
          onChange={(e) => setApplication(e.target.value)}
          placeholder="How should readers apply this to daily life?"
          className="w-full min-h-[100px] rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Verse Introduction *</label>
        <textarea
          value={verseIntroduction}
          onChange={(e) => setVerseIntroduction(e.target.value)}
          placeholder="Introduce the verse and its central purpose..."
          className="w-full min-h-[80px] rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Learn More</label>
        <textarea
          value={learnMore}
          onChange={(e) => setLearnMore(e.target.value)}
          placeholder="Additional resources, related verses, or deeper insights..."
          className="w-full min-h-[60px] rounded-xl border border-border bg-background px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          dir={isRtl ? "rtl" : "ltr"}
        />
      </div>
    </div>
  );
}
