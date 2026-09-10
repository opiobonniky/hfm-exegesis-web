"use client";

import { BookMarked, Star, Heart, Settings, History, type LucideIcon } from "lucide-react";
import { routes } from "@/components/Routes/routes";
import type { NavigateFunction } from "react-router-dom";
interface QuickLink {
  label: string;
  icon: LucideIcon;
  route: string;
}
const QUICK_LINKS: QuickLink[] = [
  { label: "Highlights", icon: Star, route: routes.highlights.path },
  { label: "Notes", icon: BookMarked, route: routes.notes.path },
  { label: "Favorites", icon: Heart, route: routes.favorites.path },
  { label: "History", icon: History, route: routes.history.path },
  { label: "Settings", icon: Settings, route: routes.settings.path },
];
interface QuickAccessIconsProps {
  navigate: NavigateFunction;
}
export default function QuickAccessIcons({ navigate }: QuickAccessIconsProps)

{
  return (
      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Quick access</h2>
        <div className="grid grid-cols-5 overflow-hidden rounded-2xl border border-[#d8d2c4] bg-[#faf8f2] dark:border-white/10 dark:bg-[#111b24]">
          {QUICK_LINKS.map((link) => (
              <button
                  key={link.label}
                  onClick={() => navigate(link.route)}
                  className="flex min-w-0 flex-col items-center gap-2 border-e border-[#e2ddd2] p-3 transition-colors last:border-e-0 hover:bg-[#f0ece2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary dark:border-white/10 dark:hover:bg-white/5"
              >
                <link.icon className="h-4 w-4 text-[#785724] dark:text-[#d7aa62]" />
                <span className="max-w-full truncate text-[9px] font-semibold text-muted-foreground sm:text-[10px]">{link.label}</span>
              </button>
          ))}
        </div>
      </section>
  )
}
