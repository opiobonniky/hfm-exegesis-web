"use client";

import { BookMarked, Star, Heart, Clock, Settings, History, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import type { NavigateFunction } from "react-router-dom";
interface QuickLink {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  route: string;
}
const QUICK_LINKS: QuickLink[] = [
  { label: "Highlights", icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", route: routes.highlights.path },
  { label: "Notes", icon: BookMarked, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", route: routes.notes.path },
  { label: "Favorites", icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", route: routes.favorites.path },
  { label: "History", icon: History, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", route: routes.history.path },
  { label: "Settings", icon: Settings, color: "text-muted-foreground", bg: "bg-muted/50", route: routes.settings.path },
];
interface QuickAccessIconsProps {
  navigate: NavigateFunction;
}
export default function QuickAccessIcons({ navigate }: QuickAccessIconsProps)

{
  return (
      <section>
        <h2 className="text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.12em] mb-3">Quick Access</h2>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_LINKS.map((link) => (
              <button
                  key={link.label}
                  onClick={() => navigate(link.route)}
                  className={cn("flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all hover:scale-105", link.bg)}
              >
                <link.icon className={cn("w-4 h-4", link.color)}/>
                <span className="text-[10px] font-medium text-muted-foreground/70">{link.label}</span>
              </button>
          ))}
        </div>
      </section>
  )
}
