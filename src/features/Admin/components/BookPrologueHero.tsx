// BookPrologueHero — decorative gradient hero header for the book prologue detail.
"use client";

import { ArrowLeft, BookOpen, Pencil, User, ScrollText, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BookPrologueDetail } from "../hooks/useBookPrologueDetail";

export function BookPrologueHero({
  item,
  onBack,
  onEdit,
}: {
  item: BookPrologueDetail;
  onBack: () => void;
  onEdit: () => void;
}) {
  const initial = (item.bookName || "B")[0]?.toUpperCase() ?? "B";
  const published = item.isPublished !== false;

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary/90 to-indigo-600 text-primary-foreground shadow-lg">
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_60%)]" />

      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-primary-foreground/90 hover:bg-white/15 hover:text-primary-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            className="gap-1.5 bg-white/95 text-primary hover:bg-white"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-inner backdrop-blur-sm">
            <span className="text-3xl font-black tracking-tight">{initial}</span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
                {item.bookName}
              </h1>
              <Badge
                variant={published ? "default" : "secondary"}
                className={
                  published
                    ? "bg-emerald-300/90 text-emerald-950 hover:bg-emerald-300"
                    : "bg-amber-300/90 text-amber-950 hover:bg-amber-300"
                }
              >
                {published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="mt-2 text-sm sm:text-base text-primary-foreground/85">
              {item.title || item.summary || "Book Prologue Overview"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {item.author && (
            <HeroStat icon={<User className="w-3.5 h-3.5" />} label={item.author} />
          )}
          {item.chapters != null && (
            <HeroStat
              icon={<BookOpen className="w-3.5 h-3.5" />}
              label={`${item.chapters} chapters`}
            />
          )}
          {item.dateWritten && (
            <HeroStat icon={<CalendarDays className="w-3.5 h-3.5" />} label={item.dateWritten} />
          )}
          {item.keyTheme && <HeroStat icon={<ScrollText className="w-3.5 h-3.5" />} label={item.keyTheme} />}
        </div>

        {(item.mainThemes?.length ?? 0) > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5 border-t border-white/20 pt-4">
            {item.mainThemes!.slice(0, 8).map((theme, i) => (
              <span
                key={i}
                className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-medium text-primary-foreground/90"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HeroStat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-primary-foreground/95">
      {icon} {label}
    </span>
  );
}
