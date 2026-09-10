"use client";

import { Microscope, ArrowRight } from "lucide-react";
import type { UserDashboardSession } from "../types";
interface StudySessionCardProps {
  session: UserDashboardSession;
  onPress?: () => void;
}
export default function StudySessionCard({ session, onPress }: StudySessionCardProps) {
  return (
    <section>
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">In progress</h2>
      <button
        onClick={onPress}
        className="flex w-full items-center gap-4 rounded-2xl border border-[#173346] bg-[#173346] p-5 text-start text-white shadow-[0_12px_30px_rgba(23,51,70,0.12)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a44] focus-visible:ring-offset-2 dark:border-[#294b61] dark:bg-[#1a3547]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5">
          <Microscope className="h-5 w-5 text-[#d7aa62]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg font-semibold text-[#fffaf0]">{session.passageRef || "Continue your study"}</p>
          <p className="mt-1 text-xs capitalize text-white/60">{session.currentStage ? `${session.currentStage} stage` : "Pick up where you left off"}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-white/60 rtl:rotate-180" />
      </button>
    </section>
  )}
