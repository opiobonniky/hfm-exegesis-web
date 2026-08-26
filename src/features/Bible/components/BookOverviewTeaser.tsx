// BookOverviewTeaser — card shown above chapter grid linking to full BookOverview
import { BookMarked, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookOverviewTeaserProps {
  bookName: string;
  isRtl: boolean;
  onClick: () => void;
}
export default function BookOverviewTeaser({
  bookName,
  isRtl,
  onClick,
}: BookOverviewTeaserProps) {
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
        "bg-primary/[0.04] border-primary/20 hover:bg-primary/[0.08] hover:border-primary/30",
        "active:scale-[0.99] group",
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        <BookMarked className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 text-start">
        <p className="text-sm font-bold text-primary">Book Overview</p>
        <p className="text-[11px] text-muted-foreground truncate">
          Read the introduction to {bookName}
        </p>
      </div>
      <Chevron
        className={cn(
          "w-5 h-5 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all",
          isRtl && "rotate-180 group-hover:-translate-x-0.5",
        )}
      />
    </button>
  );
}
