"use client";

import { Microscope, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserDashboardSession } from "../types";
interface StudySessionCardProps {
  session: UserDashboardSession;
  onPress?: () => void;
}
export default function StudySessionCard({ session, onPress }: StudySessionCardProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em] mb-4">Resume Study</h2>
      <button
        onClick={onPress}
        className="w-full flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.16] via-[#dce6ee] to-[#e5edf3] p-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md dark:from-[hsl(212_63%_24%)] dark:via-[hsl(217_33%_15%)] dark:to-[hsl(222_35%_10%)]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#55758f]">
          <Microscope className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Continue your study</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Pick up where you left off</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
      </button>
    </div>
  )}
