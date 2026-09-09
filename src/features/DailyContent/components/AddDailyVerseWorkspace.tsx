import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import type { AddDailyVersePageViewModel } from "../hooks/useAddDailyVerse";

interface Props {
  model: AddDailyVersePageViewModel;
  children: ReactNode;
}

export function AddDailyVerseWorkspace({ model: h, children }: Props) {
  const reference =
    h.book && h.chapter && h.verseNumber
      ? `${h.book} ${h.chapter}:${h.verseNumber}`
      : "Select a verse";
  const takeawayCount = h.takeaways.split("\n").filter(Boolean).length;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <main className="min-w-0">{children}</main>

      <aside className="lg:sticky lg:top-6">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-card to-accent/10 px-5 py-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Editor snapshot
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {reference}
            </h2>
          </div>

          <div className="space-y-4 p-5 text-sm">
            <SnapshotRow icon={CalendarDays} label="Publish date">
              {h.selectedDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </SnapshotRow>
            <SnapshotRow icon={Clock3} label="Time">
              {h.selectedTime}
            </SnapshotRow>
            <SnapshotRow icon={FileText} label="Translation">
              {h.bibleVersion}
            </SnapshotRow>

            <div className="border-t border-border/60 pt-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CheckCircle2
                  className={
                    h.published
                      ? "h-4 w-4 text-emerald-500"
                      : "h-4 w-4 text-muted-foreground"
                  }
                />
                {h.published ? "Ready to publish" : "Saved as draft"}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {takeawayCount > 0
                  ? `${takeawayCount} takeaway${takeawayCount === 1 ? "" : "s"} ready`
                  : "Add takeaways in Rich Content"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-foreground">{children}</span>
    </div>
  );
}
