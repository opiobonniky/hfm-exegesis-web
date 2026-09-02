"use client";

import { ArrowUpRight, BookOpen, Settings, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { routes } from "@/components/Routes/routes";
import { getGreeting } from "../utils";
import type { UserDashboardVerse } from "../types";

interface HeroSectionProps {
  userName: string;
  initial: string;
  verse: UserDashboardVerse | null;
}

export default function HeroSection({ userName, initial, verse }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="relative overflow-hidden border-b border-border/50 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.18),transparent_35%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)/0.35))]">
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <span className="text-lg font-bold text-primary-foreground">{initial}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{getGreeting(t)}</p>
              <h1 className="text-xl font-bold text-foreground">{userName}</h1>
            </div>
          </div>
          <button
            onClick={() => navigate(routes.settings.path)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/70 shadow-sm transition-colors hover:bg-muted"
            aria-label="Open settings"
          >
            <Settings className="h-4.5 w-4.5 text-muted-foreground" />
          </button>
        </div>



        

        <div className="grid items-stretch gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col justify-center py-2 lg:py-5">
            <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> A place to meet with God
            </div>
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Read The Scripture Daily.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Continue your reading, reflect on the Word, and keep your study rhythm moving forward.
            </p>
          </div>

          {verse && (
            <button
              onClick={() => navigate(routes.userDailyVerse.path)}
              className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary via-primary to-violet-700 p-6 text-start text-primary-foreground shadow-2xl shadow-primary/15 transition-transform hover:-translate-y-0.5 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border-[32px] border-white/5" />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                    <BookOpen className="h-4 w-4 text-amber-300" /> Verse of the day
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                {verse.verseText && (
                  <blockquote className="line-clamp-4 text-lg font-medium leading-8 text-white/95 sm:text-xl">
                    “{verse.verseText}”
                  </blockquote>
                )}
                <p className="mt-5 text-sm font-bold text-amber-300">
                  {verse.bookName} {verse.chapter}:{verse.verseNumber}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
