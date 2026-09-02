interface Props {
  passageRef: string;
  onGoBack: () => void;
}

export function LabReviewHeader({ passageRef, onGoBack }: Props) {
  return (
    <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onGoBack}
            className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center hover:bg-muted/60 active:scale-[0.93] transition-all shrink-0"
          >
            <span className="w-4 h-4">&larr;</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
              {passageRef}
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
              Study Review
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
