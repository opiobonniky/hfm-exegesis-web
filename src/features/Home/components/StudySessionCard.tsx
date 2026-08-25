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
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all text-start"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
          <Microscope className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Continue your study</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Pick up where you left off</p>
        <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
            </div>
      </button>
    </div>
  )}
