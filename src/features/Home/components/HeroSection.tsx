"use client";

import { Settings, Sun, ChevronRight } from "lucide-react";
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
    const {t} = useLanguage();
    return (
        <div className="relative bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
            <div
                className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"/>
            <div
                className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"/>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-lg font-bold text-primary-foreground">{initial}</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground/60">{getGreeting(t)}</p>
                            <h1 className="text-xl font-bold text-foreground">{userName}</h1>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(routes.settings.path)}
                        className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-all"
                    >
                        <Settings className="w-4.5 h-4.5 text-muted-foreground"/>
                    </button>
                </div>
                {verse && (
                    <button
                        onClick={() => navigate(routes.userDailyVerse.path)}
                        className="group w-full text-start relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/90 p-6 sm:p-7 transition-all hover:shadow-xl hover:shadow-primary/15 active:scale-[0.99]"
                    >
                        <div
                            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6TTIgMTBoMzR2MkgyVjEweiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"/>
                        <div className="relative flex items-start gap-4">
                            <div
                                className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                                <Sun className="w-5 h-5 text-white/80"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 mb-2">Verse
                                    of the day</p>
                                <p className="text-base sm:text-lg font-semibold text-white/95 leading-relaxed line-clamp-2"
                                   style={{fontFamily: "'Lora', Georgia, serif"}}>
                                    {verse.bookName} {verse.chapter}:{verse.verseNumber}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xs font-medium text-white/50">{verse.bookName}</span>
                                    <ChevronRight className="w-3 h-3 text-white/40"/>
                                </div>
                            </div>
                        </div>
                    </button>
                )}
            </div>
        </div>
    )
}
