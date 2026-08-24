"use client";

import { Trophy, Target, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
interface TriviaStatsCardProps {
  totalQuestions: number;
  correctAnswers: number;
  totalAnswered: number;
  streak: number;
}
export default function TriviaStatsCard({
  totalQuestions,
  correctAnswers,
  totalAnswered,
  streak,
}: TriviaStatsCardProps) {
  const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
  const stats = [
    {
      icon: Target,
      label: "Answered",
      value: totalAnswered,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-950/30",
    },
      icon: Trophy,
      label: "Correct",
      value: correctAnswers,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-950/30",
      icon: TrendingUp,
      label: "Accuracy",
      value: `${accuracy}%`,
      color: "text-violet-500",
      bg: "bg-violet-100 dark:bg-violet-950/30",
      icon: Flame,
      label: "Streak",
      value: streak,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-950/30",
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-3 text-center"
          >
            <div className={cn("w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center", stat.bg)}>
              <Icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              {stat.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
function Flame(props: any) {
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
