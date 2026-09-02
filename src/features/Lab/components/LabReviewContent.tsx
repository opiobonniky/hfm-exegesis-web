interface Props {
  session: any;
  onGoBack: () => void;
}

export function LabReviewContent({ session, onGoBack }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/40 bg-muted/20 overflow-hidden">
            <div className="px-5 py-4">
              <p className="text-sm font-semibold">{session.passageRef}</p>
              <p className="text-xs text-muted-foreground mt-1">Book: {session.bookName} &middot; Ch. {session.chapter}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 hover:border-border/80 transition-all"
          >
            &larr; Back to Studies
          </button>
        </div>
      </div>
    </div>
  );
}
