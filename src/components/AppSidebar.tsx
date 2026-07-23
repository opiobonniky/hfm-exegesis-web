import {
  BookOpen,
  LayoutDashboard,
  Sun,
  BookMarked,
  Plus,
  LogOut,
  ChevronDown,
  Users,
  BookText,
  Home,
  Highlighter,
  PenLine,
  Lightbulb,
  LayoutTemplate,
  SproutIcon,
  Search as SearchIcon,
  Sparkles,
  Microscope,
  CreditCard,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  { title: "sidebar.dashboard", url: routes.dashboard.path, icon: LayoutDashboard },
  { title: "sidebar.activity", url: routes.systemUsers.path, icon: Users },
  { title: "sidebar.bible", url: routes.bibleReader.path, icon: BookText },
  { title: "sidebar.dailyVerse", url: routes.dailyVerse.path, icon: Sun },
  { title: "sidebar.devotions", url: routes.dailyDevotions.path, icon: SproutIcon },
  { title: "sidebar.explanations", url: routes.verseExplanations.path, icon: BookMarked },
  { title: "sidebar.studyTools", url: routes.adminStudyTools.path, icon: BookText },
  { title: "sidebar.readingPlans", url: routes.readingPlans.path, icon: BookOpen },
  { title: "sidebar.myActivity", url: routes.myActivity.path, icon: Highlighter },
];

const journalSubItems: NavItem[] = [
  { title: "sidebar.journal", url: routes.journal.path, icon: PenLine },
  { title: "sidebar.journalPrompts", url: routes.journalPrompts.path, icon: Lightbulb },
  { title: "sidebar.journalTemplates", url: routes.journalTemplates.path, icon: LayoutTemplate },
];

const userNavItems: NavItem[] = [
  { title: "sidebar.myDashboard", url: routes.home.path, icon: Home },
  { title: "sidebar.bible", url: routes.bibleLibrary.path, icon: BookText },
  { title: "sidebar.search", url: routes.search.path, icon: SearchIcon },
  { title: "sidebar.dailyVerse", url: routes.userDailyVerse.path, icon: Sun },
  { title: "sidebar.dailyExegesis", url: routes.dailyExegesis.path, icon: BookOpen },
  { title: "sidebar.devotions", url: routes.userDevotions.path, icon: SproutIcon },
  { title: "sidebar.readingPlans", url: routes.userPlans.path, icon: BookOpen },
  { title: "sidebar.myActivity", url: routes.myActivity.path, icon: Highlighter },
  { title: "sidebar.journal", url: routes.journal.path, icon: PenLine },
  { title: "sidebar.exegesisLab", url: routes.dictionary.path, icon: Microscope },
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
  return key;
};

/* ── Pill Nav Item ──────────────────────────────────────────────────────── */

function PillNavItem({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const label = getNavTitle(useLanguage().t, item.title);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.url}
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
              "flex items-center w-full transition-all duration-200 rounded-xl",
              collapsed ? "justify-center p-1" : "gap-3 p-2",
              active
                ? "bg-accent/10 dark:bg-accent/15 shadow-sm"
                : "hover:bg-accent/5 dark:hover:bg-accent/8",
            )}
          >
            {/* Icon container */}
            <div
              className={cn(
                "flex items-center justify-center shrink-0 transition-all duration-300",
                "rounded-lg",
                collapsed ? "w-9 h-9" : "w-8 h-8",
                active
                  ? "bg-accent text-accent-foreground shadow-[0_2px_8px_rgba(232,163,23,0.25)]"
                  : "bg-transparent group-hover:bg-accent/10 dark:group-hover:bg-accent/15",
              )}
            >
              <Icon
                className={cn(
                  "transition-all duration-200",
                  collapsed ? "w-4 h-4" : "w-3.5 h-3.5",
                  active
                    ? "text-accent-foreground"
                    : "text-foreground/40 group-hover:text-accent/80 dark:group-hover:text-accent/70",
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
                    ? "font-semibold text-foreground"
                    : "font-normal text-foreground/60 group-hover:text-foreground/80",
                )}
              >
                {label}
              </span>
            )}

            {/* Active dot */}
            {active && !collapsed && (
              <span className="ml-auto w-1 h-1 rounded-full bg-accent shrink-0 shadow-[0_0_4px_rgba(232,163,23,0.4)]" />
            )}
          </div>
        );
      }}
    </NavLink>
  );
}

/* ── Section Divider ────────────────────────────────────────────────────── */

function SectionDivider({ collapsed }: { collapsed: boolean }) {
  if (collapsed) return <div className="mx-auto my-3 w-4 h-px bg-border/50" />;
  return <div className="mx-3 my-3 h-px bg-gradient-to-r from-border/60 via-border/30 to-transparent" />;
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { userInfo, logout } = useAuth();
  const { t, isRtl } = useLanguage();

  const isAdmin = userInfo?.userRole === 1;
  const mainNavItems = isAdmin ? adminNavItems : userNavItems;
  const isActive = (path: string) => location.pathname === path;

  const anyJournalActive = isAdmin && journalSubItems.some((sub) => isActive(sub.url));
  const [journalOpen, setJournalOpen] = useState(false);

  useEffect(() => {
    if (!anyJournalActive) setJournalOpen(false);
  }, [anyJournalActive]);

  /* ── Render helper for nav list ── */
  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => (
      <li key={item.title}>
        <PillNavItem item={item} isActive={isActive(item.url)} collapsed={collapsed} />
      </li>
    ));

  /* ── Render helper for collapsed nav items (with tooltips) ── */
  const renderCollapsedNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const label = getNavTitle(t, item.title);
      return (
        <li key={item.title}>
          <CollapsedTooltipButton label={label}>
            <PillNavItem item={item} isActive={isActive(item.url)} collapsed />
          </CollapsedTooltipButton>
        </li>
      );
    });

  return (
    <>
      <style>{`
        /* ── Sidebar core chrome ── */
        [data-sidebar="sidebar"] {
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
          "transition-all duration-300 ease-out",
          collapsed ? "w-[68px]" : "w-64",
        )}
        collapsible="icon"
      >
        {/* ═══════════════════════════════════════════════════════════════════
           HEADER — Minimal brand mark
           ═══════════════════════════════════════════════════════════════════ */}
        <SidebarHeader className={collapsed ? "px-2 pt-4 pb-2" : "px-4 pt-5 pb-3"}>
          <NavLink
            to={isAdmin ? routes.dashboard.path : routes.home.path}
            className={cn(
              "group block transition-all duration-200",
              collapsed ? "mx-auto" : "",
            )}
          >
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "flex-col gap-1.5",
            )}>
              {/* Logo */}
              <div className={cn(
                "shrink-0 flex items-center justify-center",
                "bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl",
                "ring-1 ring-accent/10 group-hover:ring-accent/25",
                "transition-all duration-300 group-hover:scale-105",
                collapsed ? "w-10 h-10" : "w-9 h-9",
              )}>
                <img
                  src={logoImage}
                  alt={t.brand?.title || "EXEGESIS"}
                  className={cn(
                    "object-contain",
                    collapsed ? "w-7 h-7 p-1" : "w-6 h-6 p-1",
                  )}
                />
              </div>

              {/* Brand text */}
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-foreground/90">
                    Exegesis
                  </span>
                  <span className="text-[9px] font-medium tracking-[0.18em] uppercase text-foreground/25">
                    Bible Study
                  </span>
                </div>
              )}
            </div>
          </NavLink>
        </SidebarHeader>

        {/* ═══════════════════════════════════════════════════════════════════
           NAVIGATION
           ═══════════════════════════════════════════════════════════════════ */}
        <SidebarContent className="sidebar-scroll px-2 py-1 overflow-y-auto overflow-x-hidden">
          {/* ── Main Menu ── */}
          <nav>
            <ul className={cn("flex flex-col", collapsed ? "gap-1" : "gap-0.5")}>
              {collapsed ? renderCollapsedNavItems(mainNavItems) : renderNavItems(mainNavItems)}
            </ul>
          </nav>

          {/* ── Journal (admin collapsible) ── */}
          {isAdmin && (
            <>
              <SectionDivider collapsed={collapsed} />
              <div className={collapsed ? "mb-2" : "mb-1"}>
                {collapsed ? (
                  <div className="flex flex-col items-center gap-1">
                    <CollapsedTooltipButton label={getNavTitle(t, "sidebar.journal")}>
                      <div
                        onClick={() => setJournalOpen(!journalOpen)}
                        className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer transition-all duration-200",
                          anyJournalActive
                            ? "bg-accent text-accent-foreground shadow-[0_2px_8px_rgba(232,163,23,0.25)]"
                            : "text-foreground/40 hover:bg-accent/10 hover:text-accent/80",
                        )}
                      >
                        <PenLine className="w-4 h-4" />
                      </div>
                    </CollapsedTooltipButton>
                    {journalOpen && (
                      <div className="flex flex-col items-center gap-1 mt-1 animate-sub-menu">
                        {journalSubItems.map((sub) => {
                          const subLabel = getNavTitle(t, sub.title);
                          const Icon = sub.icon;
                          return (
                            <CollapsedTooltipButton key={sub.title} label={subLabel}>
                              <NavLink
                                to={sub.url}
                                className={cn(
                                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                                  isActive(sub.url)
                                    ? "bg-accent/15 text-accent"
                                    : "text-foreground/30 hover:text-foreground/60 hover:bg-accent/8",
                                )}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </NavLink>
                            </CollapsedTooltipButton>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Collapsible
                    open={journalOpen}
                    onOpenChange={setJournalOpen}
                    className="group/collapsible"
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center gap-3 w-full p-2 rounded-xl transition-all duration-200",
                          anyJournalActive
                            ? "bg-accent/10 dark:bg-accent/15 shadow-sm"
                            : "hover:bg-accent/5 dark:hover:bg-accent/8",
                        )}
                      >
                        {/* Icon container */}
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 shrink-0",
                            anyJournalActive
                              ? "bg-accent text-accent-foreground shadow-[0_2px_8px_rgba(232,163,23,0.25)]"
                              : "bg-transparent group-hover:bg-accent/10 dark:group-hover:bg-accent/15 text-foreground/40",
                          )}
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </div>

                        <span
                          className={cn(
                            "text-sm flex-1 text-start transition-all duration-200 truncate",
                            anyJournalActive
                              ? "font-semibold text-foreground"
                              : "font-normal text-foreground/60 group-hover:text-foreground/80",
                          )}
                        >
                          {getNavTitle(t, "sidebar.journal")}
                        </span>

                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 shrink-0 transition-all duration-300",
                            "group-data-[state=open]/collapsible:rotate-180",
                            anyJournalActive
                              ? "text-foreground/50"
                              : "text-foreground/20 group-hover:text-foreground/40",
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="animate-sub-menu">
                      <ul className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-accent/20 pl-3">
                        {journalSubItems.map((sub) => {
                          const subLabel = getNavTitle(t, sub.title);
                          const Icon = sub.icon;
                          return (
                            <li key={sub.title}>
                              <NavLink
                                to={sub.url}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                                  isActive(sub.url)
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-foreground/50 hover:text-foreground/80 hover:bg-accent/5",
                                )}
                              >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{subLabel}</span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </>
          )}

          {/* ── Manage / Settings section for all users ── */}
          <SectionDivider collapsed={collapsed} />
          <nav>
            <ul className={cn("flex flex-col", collapsed ? "gap-1" : "gap-0.5")}>
              {collapsed
                ? renderCollapsedNavItems(manageNavItems)
                : renderNavItems(manageNavItems)}
            </ul>
          </nav>
        </SidebarContent>

        {/* ═══════════════════════════════════════════════════════════════════
           FOOTER — Compact: user avatar + sign out only
           ═══════════════════════════════════════════════════════════════════ */}
        <SidebarFooter className={cn(
          collapsed ? "px-2 pb-3 pt-2" : "px-3 pb-4 pt-1",
        )}>
          {/* {─ Sign Out Button ─} */}
          <button
            onClick={logout}
            className={cn(
              "door-hover flex items-center w-full rounded-xl transition-all duration-200",
              "text-foreground/30 hover:text-red-400 hover:bg-red-500/8",
              collapsed
                ? "justify-center p-2"
                : "gap-3 px-3 py-2.5",
            )}
          >
            <div className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200 shrink-0",
              collapsed ? "w-9 h-9" : "w-8 h-8",
            )}>
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
