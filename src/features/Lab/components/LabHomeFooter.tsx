interface Props {
  historyCount: number;
}

export function LabHomeFooter({ historyCount }: Props) {
  return (
    <section className="border-t border-border/20 bg-muted/10">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 text-center">
        <p className="text-[10px] text-muted-foreground/40">Your study journey &middot; {historyCount} session{historyCount !== 1 ? "s" : ""}</p>
      </div>
    </section>
  );
}
