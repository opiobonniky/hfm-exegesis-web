"use client";

import { ArrowRight, BookOpen, Settings } from "lucide-react";
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
    <header className="border-b border-[#d8d2c4] bg-[#faf8f2] dark:border-white/10 dark:bg-[#111b24]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
        <div className="mb-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1d3a4d]/20 bg-[#e8e1d2] dark:border-white/15 dark:bg-white/10">
              <span className="font-serif text-lg font-semibold text-[#173346] dark:text-[#f3e8cf]">{initial}</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{getGreeting(t)}</p>
              <h1 className="font-serif text-xl font-semibold text-foreground">{userName}</h1>
            </div>
          </div>
          <button
            onClick={() => navigate(routes.settings.path)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d2c4] bg-transparent transition-colors hover:border-[#173346] hover:bg-[#ebe6da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/15 dark:hover:bg-white/10"
            aria-label="Open settings"
          >
            <Settings className="h-4.5 w-4.5 text-muted-foreground" />
          </button>
        </div>



        <div className="grid items-stretch gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
          <div className="flex flex-col justify-center border-s-2 border-[#b88a44] py-2 ps-5 lg:py-6 lg:ps-7">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#946b30] dark:text-[#d9b879]">
              Your daily rhythm
            </p>
            <h2 className="max-w-xl font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[#173346] dark:text-[#f5f0e5] sm:text-5xl">
              Make room for the Word.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Read with attention, study with purpose, and carry one truth into the rest of your day.
            </p>
          </div>

          {verse && (
            <button
              onClick={() => navigate(routes.userDailyVerse.path)}
              className="group relative overflow-hidden rounded-[1.5rem] bg-[#173346] p-6 text-start text-[#f8f3e8] shadow-[0_18px_45px_rgba(23,51,70,0.16)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a44] focus-visible:ring-offset-2 sm:p-8 dark:bg-[#1a3547]"
            >
              <div className="absolute inset-y-0 start-0 w-1 bg-[#c89a51]" />
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d8c9aa]">
                    <BookOpen className="h-4 w-4 text-[#d7aa62]" /> Verse of the day
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:bg-white/10">
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </span>
                </div>
                {verse.verseText && (
                  <blockquote className="line-clamp-4 font-serif text-xl leading-8 text-[#fffaf0] sm:text-2xl sm:leading-9">
                    &ldquo;{verse.verseText}&rdquo;
                  </blockquote>
                )}
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#d7aa62]">
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
