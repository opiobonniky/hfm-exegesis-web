import { BookOpen, Sparkles } from "lucide-react";
import type { TriviaHomeHeroProps } from "../types";

export default function TriviaHomeHero({ answeredCount }: TriviaHomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-[#55758f] p-7 text-primary-foreground shadow-xl shadow-primary/15 sm:p-10">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/65">
            <Sparkles className="h-4 w-4" /> Scripture challenge
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Grow through every question.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-primary-foreground/75">
            Test your Bible knowledge, build a consistent streak, and discover the stories behind every answer.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-black/10 px-5 py-4">
          <BookOpen className="h-5 w-5" />
          <div>
            <p className="text-xl font-black">{answeredCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-primary-foreground/65">Answered</p>
          </div>
        </div>
      </div>
    </section>
  );
}
