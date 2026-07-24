import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Home,
  Microscope,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "./Routes/routes";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSubscription } from "@/hooks/useSubscription";

const LAST_BIBLE_KEY = "exegesis_last_bible";

function getBibleUrl(): string {
  try {
    const raw = localStorage.getItem(LAST_BIBLE_KEY);
    if (raw) {
      const { book, chapter } = JSON.parse(raw);
      if (book && chapter) {
        return `${routes.bibleReader.path}?book=${encodeURIComponent(book)}&chapter=${chapter}`;
      }
    }
  } catch {}
  return routes.bibleLibrary.path;
}

interface NavTab {
  label: string;
  icon: typeof Home;
  path: string;
  activePaths: string[];
  minTier?: "free" | "legacy_sower" | "covenant_sower";
}

const NAV_TABS: NavTab[] = [
  {
    label: "Home",
    icon: Home,
    path: routes.home.path,
    activePaths: [routes.home.path, routes.userDashboard.path],
  },
  {
    label: "Bible",
    icon: BookOpen,
    path: routes.bibleLibrary.path,
    activePaths: [
      routes.bibleLibrary.path,
      routes.bibleLibraryLegacy.path,
      routes.bibleReader.path,
    ],
  },
  {
    label: "Lab",
    icon: Microscope,
    path: routes.dictionary.path,
    activePaths: [routes.dictionary.path, routes.labFlow.path],
    minTier: "legacy_sower",
  },
  {
    label: "Journal",
    icon: PenLine,
    path: routes.journal.path,
    activePaths: [
      routes.journal.path,
      routes.newJournalEntry.path,
      routes.journalEntry.path,
      routes.journalDetail.path,
    ],
  },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const { hasAccess } = useSubscription();

  const isActive = (tab: NavTab) =>
    tab.activePaths.some((p) => location.pathname.startsWith(p));

  const getLabel = (baseLabel: string): string => {
    const key = `sidebar.${baseLabel.toLowerCase()}`;
    const parts = key.split(".");
    if (parts.length === 2 && (t as any)[parts[0]]?.[parts[1]]) {
      return (t as any)[parts[0]][parts[1]];
    }
    return baseLabel;
  };

  const handleTabClick = (tab: NavTab) => {
    if (tab.label === "Bible") {
      navigate(getBibleUrl());
      return;
    }
    if (tab.minTier && !hasAccess(tab.minTier)) {
      navigate(routes.sower.path);
      return;
    }
    navigate(tab.path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden safe-area-inset-bottom"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="h-px bg-border/60" />

      <div
        className="flex items-center justify-around px-2 py-1.5"
        style={{
          background: "hsl(var(--background) / 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[52px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground/60 hover:text-muted-foreground",
              )}
            >
              {active && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
              )}

              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-150",
                  active && "scale-110",
                )}
                strokeWidth={active ? 2.2 : 1.8}
              />

              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide transition-all duration-150",
                  active ? "opacity-100" : "opacity-60",
                )}
              >
                {getLabel(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
