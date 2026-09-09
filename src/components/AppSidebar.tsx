import {
  BookOpen,
  LayoutDashboard,
  Sun,
  BookMarked,
  Plus,
  LogOut,
  Users,
  BookText,
  Home,
  Highlighter,
  PenLine,
  SproutIcon,
  Search as SearchIcon,
  Sparkles,
  Microscope,
  HelpCircle,
  CalendarDays,
  CreditCard,
  FileText,
  Star,
  Clock,
  ScrollText,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import { routes } from "./Routes/routes";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

/* ───────────────────────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────────────────────── */

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

/* ─── Nav items ────────────────────────────────────────────────────────────── */

const adminNavItems: NavItem[] = [
  {
    title: "sidebar.dashboard",
    url: routes.dashboard.path,
    icon: LayoutDashboard,
  },

  { title: "sidebar.users", url: routes.adminUsers.path, icon: Users },
  { title: "sidebar.bible", url: routes.bibleReader.path, icon: BookText },
  {
    title: "sidebar.dailyContentAdmin",
    url: routes.adminDailyContent.path,
    icon: CalendarDays,
  },
  {
    title: "sidebar.journalModeration",
    url: routes.adminJournalModeration.path,
    icon: PenLine,
  },
  {
    title: "sidebar.bookPrologues",
    url: routes.adminBookPrologues.path,
    icon: ScrollText,
  },

  {
    title: "sidebar.explanations",
    url: routes.adminVerseExplanations.path,
    icon: BookMarked,
  },
  {
    title: "sidebar.readingPlans",
    url: routes.readingPlans.path,
    icon: BookOpen,
  },

  {
    title: "sidebar.studyTools",
    url: routes.adminStudyTools.path,
    icon: BookText,
  },
  {
    title: "sidebar.triviaAdmin",
    url: routes.adminTrivia.path,
    icon: HelpCircle,
  },
  {
    title: "sidebar.subscriptionsAdmin",
    url: routes.adminSubscriptions.path,
    icon: CreditCard,
  },
];

const userNavItems: NavItem[] = [
  { title: "sidebar.myDashboard", url: routes.home.path, icon: Home },
  { title: "sidebar.bible", url: routes.bibleLibrary.path, icon: BookText },
  { title: "sidebar.search", url: routes.search.path, icon: SearchIcon },
  { title: "sidebar.dailyVerse", url: routes.userDailyVerse.path, icon: Sun },
  {
    title: "sidebar.dailyExegesis",
    url: routes.dailyExegesis.path,
    icon: BookOpen,
  },
  {
    title: "sidebar.devotions",
    url: routes.userDevotions.path,
    icon: SproutIcon,
  },
  { title: "sidebar.readingPlans", url: routes.userPlans.path, icon: BookOpen },
  {
    title: "sidebar.highlights",
    url: routes.highlights.path,
    icon: Highlighter,
  },
  { title: "sidebar.notes", url: routes.notes.path, icon: FileText },
  { title: "sidebar.favorites", url: routes.favorites.path, icon: Star },
  { title: "sidebar.history", url: routes.history.path, icon: Clock },
  { title: "sidebar.journal", url: routes.journal.path, icon: PenLine },
  {
    title: "sidebar.exegesisLab",
    url: routes.strongsDictionary.path,
    icon: Microscope,
  },
  { title: "sidebar.studyBible", url: routes.studyBible.path, icon: BookText },
  { title: "sidebar.trivia", url: routes.trivia.path, icon: Sparkles },
];

const manageNavItems: NavItem[] = [
  { title: "common.settings", url: routes.settings.path, icon: Plus },
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const getNavTitle = (t: any, key: string): string => {
  const parts = key.split(".");
  if (parts.length === 2 && t[parts[0]] && t[parts[0]][parts[1]]) {
    return t[parts[0]][parts[1]];
  }
  if (key === "sidebar.journalModeration") return "Journal Moderation";
  if (key === "sidebar.bookPrologues") return "Book Prologues";
  return key;
};

/* ── Pill Nav Item ──────────────────────────────────────────────────────── */

function PillNavItem({
  item,
  isActive,
  collapsed,
  onNavClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const label = getNavTitle(useLanguage().t, item.title);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.url}
      onClick={onNavClick}
      className={cn(
        "group flex items-center gap-3 w-full transition-all duration-200",
        collapsed ? "justify-center px-0" : "px-1",
      )}
    >
      {({ isActive: linkActive }: { isActive: boolean }) => {
        const active = linkActive || isActive;
        return (
          <div
            className={cn(
              "relative flex items-center w-full overflow-hidden transition-all duration-200 rounded-xl border border-transparent",
              collapsed ? "justify-center p-1" : "gap-3 p-2",
              active
                ? "border-primary-foreground/20 bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/10 to-transparent shadow-sm"
                : "hover:border-primary-foreground/15 hover:bg-gradient-to-r hover:from-primary-foreground/10 hover:to-transparent",
            )}
          >
            {active && (
              <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-primary via-primary/60 to-primary shadow-[0_0_10px_hsl(var(--primary)/0.55)] rtl:left-auto rtl:right-0" />
            )}
            {/* Icon container */}
            <div
              className={cn(
                "flex items-center justify-center shrink-0 transition-all duration-300",
                "rounded-lg",
                collapsed ? "w-9 h-9" : "w-8 h-8",
                active
                  ? "bg-primary-foreground text-primary shadow-[0_4px_12px_hsl(var(--primary)/0.28)]"
                  : "bg-primary-foreground/10 group-hover:bg-primary-foreground/15",
              )}
            >
              <Icon
                className={cn(
                  "transition-all duration-200",
                  collapsed ? "w-4 h-4" : "w-3.5 h-3.5",
                  active
                    ? "text-primary"
                    : "text-primary-foreground/60 group-hover:text-primary-foreground",
                  !active && collapsed && "group-hover:scale-110",
                )}
              />
            </div>

            {/* Label */}
            {!collapsed && (
              <span
                className={cn(
                  "text-sm transition-all duration-200 truncate",
                  active
                    ? "font-semibold text-primary-foreground"
                    : "font-normal text-primary-foreground/65 group-hover:text-primary-foreground",
                )}
              >
                {label}
              </span>
            )}

            {/* Active dot */}
            {active && !collapsed && (
              <span className="ml-auto w-1 h-1 rounded-full bg-primary-foreground shrink-0 shadow-[0_0_4px_hsl(var(--primary-foreground)/0.4)]" />
            )}
          </div>
        );
      }}
    </NavLink>
  );
}

/* ── Section Divider ────────────────────────────────────────────────────── */

function SectionDivider({ collapsed }: { collapsed: boolean }) {
  if (collapsed)
    return (
      <div className="mx-auto my-3 h-px w-5 bg-gradient-to-r from-transparent via-primary/35 to-transparent cathedral:via-primary/50" />
    );
  return (
    <div className="mx-3 my-3 h-px bg-gradient-to-r from-primary/35 via-primary/15 to-transparent" />
  );
}

/* ── Collapsed Tooltip Button ───────────────────────────────────────────── */

function CollapsedTooltipButton({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group/tooltip relative flex justify-center">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 z-50">
        <div className="bg-popover text-popover-foreground text-xs font-medium px-2.5 py-1 rounded-lg shadow-lg border whitespace-nowrap backdrop-blur-sm">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Bible Nav Item (dynamic — checks last-read position) ──────────────── */

const LAST_BIBLE_KEY = "exegesis_last_bible";

function getBibleNavUrl(): string {
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

function BibleNavItem({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useLanguage().t;
  const label = getNavTitle(t, "sidebar.bible");
  const targetUrl = getBibleNavUrl();
  const isBibleReaderActive = location.pathname.startsWith(
    routes.bibleReader.path,
  );
  const isBibleLibraryActive = location.pathname.startsWith(
    routes.bibleLibrary.path,
  );
  const active = isBibleReaderActive || isBibleLibraryActive;

  return (
    <button
      onClick={() => {
        navigate(targetUrl);
        onNavClick?.();
      }}
      className={cn(
        "group flex items-center gap-3 w-full transition-all duration-200",
        collapsed ? "justify-center px-0" : "px-1",
      )}
    >
      <div
        className={cn(
          "relative flex items-center w-full overflow-hidden transition-all duration-200 rounded-xl border border-transparent",
          collapsed ? "justify-center p-1" : "gap-3 p-2",
          active
            ? "border-primary-foreground/20 bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/10 to-transparent shadow-sm"
            : "hover:border-primary-foreground/15 hover:bg-gradient-to-r hover:from-primary-foreground/10 hover:to-transparent",
        )}
      >
        {active && (
          <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-primary via-primary/60 to-primary shadow-[0_0_10px_hsl(var(--primary)/0.55)] rtl:left-auto rtl:right-0" />
        )}
        <div
          className={cn(
            "flex items-center justify-center shrink-0 transition-all duration-300",
            "rounded-lg",
            collapsed ? "w-9 h-9" : "w-8 h-8",
            active
              ? "bg-primary-foreground text-primary shadow-[0_4px_12px_hsl(var(--primary)/0.28)]"
              : "bg-primary-foreground/10 group-hover:bg-primary-foreground/15",
          )}
        >
          <BookText
            className={cn(
              "transition-all duration-200",
              collapsed ? "w-4 h-4" : "w-3.5 h-3.5",
              active
                ? "text-primary"
                : "text-primary-foreground/60 group-hover:text-primary-foreground",
              !active && collapsed && "group-hover:scale-110",
            )}
          />
        </div>

        {!collapsed && (
          <span
            className={cn(
              "text-sm transition-all duration-200 truncate",
              active
                ? "font-semibold text-primary-foreground"
                : "font-normal text-primary-foreground/65 group-hover:text-primary-foreground",
            )}
          >
            {label}
          </span>
        )}

        {active && !collapsed && (
          <span className="ml-auto w-1 h-1 rounded-full bg-primary-foreground shrink-0 shadow-[0_0_4px_hsl(var(--primary-foreground)/0.4)]" />
        )}
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { userInfo, logout } = useAuth();
  const { t, isRtl } = useLanguage();

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isAdmin = userInfo?.userRole === 1;
  const mainNavItems = isAdmin ? adminNavItems : userNavItems;
  const isActive = (path: string) => location.pathname === path;

  /* ── Render helper for nav list ── */
  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => {
      if (item.title === "sidebar.bible" && !isAdmin) {
        return (
          <li key={item.title}>
            <BibleNavItem
              collapsed={collapsed}
              onNavClick={closeMobileSidebar}
            />
          </li>
        );
      }
      return (
        <li key={item.title}>
          <PillNavItem
            item={item}
            isActive={isActive(item.url)}
            collapsed={collapsed}
            onNavClick={closeMobileSidebar}
          />
        </li>
      );
    });

  /* ── Render helper for collapsed nav items (with tooltips) ── */
  const renderCollapsedNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const label = getNavTitle(t, item.title);
      if (item.title === "sidebar.bible" && !isAdmin) {
        return (
          <li key={item.title}>
            <CollapsedTooltipButton label={label}>
              <BibleNavItem collapsed onNavClick={closeMobileSidebar} />
            </CollapsedTooltipButton>
          </li>
        );
      }
      return (
        <li key={item.title}>
          <CollapsedTooltipButton label={label}>
            <PillNavItem
              item={item}
              isActive={isActive(item.url)}
              collapsed
              onNavClick={closeMobileSidebar}
            />
          </CollapsedTooltipButton>
        </li>
      );
    });

  return (
    <>
      <style>{`
        /* ── Sidebar core chrome ── */
        /* Only override sidebar accent in cathedral mode (gold accents).
           Light and dark modes use their own --sidebar-accent from index.css */
        .cathedral [data-sidebar="sidebar"] {
          --sidebar-accent: hsl(var(--accent));
          --sidebar-accent-foreground: hsl(var(--accent-foreground));
        }

        /* Scrollbar styling */
        .sidebar-scroll::-webkit-scrollbar {
          width: 2px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 999px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground));
        }

        /* Collapsible content animation */
        @keyframes subMenuSlide {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-sub-menu {
          animation: subMenuSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Sign out hover effect */
        @keyframes doorSlide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(2px); }
        }
        .door-hover:hover .door-icon {
          animation: doorSlide 0.6s ease-in-out infinite;
        }
      `}</style>

      <Sidebar
        side={isRtl ? "right" : "left"}
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          isRtl
            ? "border-l border-border/50 [&>div]:border-l-0"
            : "border-r border-border/50 [&>div]:border-r-0",
          "bg-primary text-primary-foreground shadow-[4px_0_24px_hsl(var(--primary)/0.25)] transition-all duration-300 ease-out dark:bg-[hsl(203_31%_35%)] cathedral:dark:bg-primary",
          "[&>div]:bg-primary [&>div]:text-primary-foreground dark:[&>div]:bg-[hsl(203_31%_35%)] cathedral:dark:[&>div]:bg-primary",
          collapsed ? "w-[68px]" : "w-64",
        )}
        collapsible="icon"
      >
        {/* ═══════════════════════════════════════════════════════════════════
           HEADER — Minimal brand mark
           ═══════════════════════════════════════════════════════════════════ */}
        <SidebarHeader
          className={collapsed ? "px-2 pt-4 pb-2" : "px-4 pt-6 pb-4"}
        >
          <NavLink
            to={isAdmin ? routes.dashboard.path : routes.home.path}
            className={cn(
              "group relative block overflow-hidden rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-2 transition-all duration-200 hover:border-primary-foreground/35 hover:bg-primary-foreground/15 hover:shadow-sm",
              collapsed ? "mx-auto" : "",
            )}
          >
            <div className={cn(collapsed && "flex-col items-center gap-1.5")}>
              {/* Logo — the image already contains the app name text */}
              <div
                className={cn(
                  "mx-auto flex items-center justify-center",
                  collapsed ? "w-10 h-10" : "w-[140px] h-[140px]",
                )}
              >
                <img
                  src={logoImage}
                  alt={t.brand?.title || "EXEGESIS"}
                  className={cn(
                    "object-contain brightness-0 invert drop-shadow-[0_2px_10px_rgba(255,255,255,0.18)]",
                    collapsed ? "w-8 h-8 p-0.5" : "w-full h-full p-3",
                  )}
                />
              </div>
            </div>
          </NavLink>
        </SidebarHeader>

        {/* ═══════════════════════════════════════════════════════════════════
           NAVIGATION
           ═══════════════════════════════════════════════════════════════════ */}
        <SidebarContent className="sidebar-scroll relative overflow-y-auto overflow-x-hidden bg-primary px-2 py-2 dark:bg-[hsl(203_31%_35%)] cathedral:dark:bg-primary">
          <div className="pointer-events-none absolute inset-x-2 top-0 h-24 rounded-2xl bg-gradient-to-b from-primary-foreground/10 via-primary-foreground/[0.03] to-transparent blur-sm" />
          {/* ── Main Menu ── */}
          <nav className="relative rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.06] p-1">
            <ul
              className={cn("flex flex-col", collapsed ? "gap-1" : "gap-0.5")}
            >
              {collapsed
                ? renderCollapsedNavItems(mainNavItems)
                : renderNavItems(mainNavItems)}
            </ul>
          </nav>

          {/* ── Manage / Settings section for all users ── */}
          <SectionDivider collapsed={collapsed} />
          <nav className="relative rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.06] p-1">
            <ul
              className={cn("flex flex-col", collapsed ? "gap-1" : "gap-0.5")}
            >
              {collapsed
                ? renderCollapsedNavItems(manageNavItems)
                : renderNavItems(manageNavItems)}
            </ul>
          </nav>
        </SidebarContent>

        {/* ═══════════════════════════════════════════════════════════════════
           FOOTER — Compact: user avatar + sign out only
           ═══════════════════════════════════════════════════════════════════ */}
        <SidebarFooter
          className={cn(collapsed ? "px-2 pb-3 pt-2" : "px-3 pb-4 pt-1")}
        >
          {/* {─ Sign Out Button ─} */}
          <button
            onClick={logout}
            className={cn(
              "door-hover flex items-center w-full rounded-xl border border-transparent transition-all duration-200",
              "text-primary-foreground/65 hover:border-red-300/25 hover:bg-gradient-to-r hover:from-red-300/15 hover:to-transparent hover:text-red-100",
              collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-lg transition-all duration-200 shrink-0",
                collapsed ? "w-9 h-9" : "w-8 h-8",
              )}
            >
              <LogOut className="door-icon w-3.5 h-3.5 transition-all duration-200" />
            </div>
            {!collapsed && (
              <span className="text-sm font-medium">
                {t.sidebar?.logout || "Sign Out"}
              </span>
            )}
          </button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
