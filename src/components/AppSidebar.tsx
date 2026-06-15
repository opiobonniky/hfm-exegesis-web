import {
  BookOpen,
  LayoutDashboard,
  Sun,
  BookMarked,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Users,
  BookText,
  Home,
  Highlighter,
  PenLine,
  Lightbulb,
  LayoutTemplate,
  SproutIcon,
  Globe,
  Check,
  Loader2,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { routes } from "./Routes/routes";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

const LANGUAGE_GROUPS = (t: any): { label: string; labelKey: string; languages: Language[] }[] => [
  { label: t.languageGroups?.primary || 'Primary', labelKey: 'primary', languages: ["en"] },
  {
    label: t.languageGroups?.european || 'European',
    labelKey: 'european',
    languages: ["de", "fr", "es", "pt", "it", "el", "ru"],
  },
  {
    label: t.languageGroups?.indian || 'Indian',
    labelKey: 'indian',
    languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"],
  },
  { label: t.languageGroups?.other || 'Other', labelKey: 'other', languages: ["ar", "sw", "ne", "fil"] },
];

const adminNavItems = [
  { title: "sidebar.dashboard", url: routes.dashboard.path, icon: LayoutDashboard },
  { title: "sidebar.activity", url: routes.systemUsers.path, icon: Users },
  { title: "sidebar.bible", url: routes.bibleReader.path, icon: BookText },
  { title: "sidebar.dailyVerse", url: routes.dailyVerse.path, icon: Sun },
  { title: "sidebar.devotions", url: routes.dailyDevotions.path, icon: SproutIcon },
  { title: "sidebar.explanations", url: routes.verseExplanations.path, icon: BookMarked },
  { title: "sidebar.readingPlans", url: routes.readingPlans.path, icon: BookOpen },
  { title: "sidebar.myActivity", url: routes.myActivity.path, icon: Highlighter },
];

const journalSubItems = [
  { title: "sidebar.journal", url: routes.journal.path, icon: PenLine },
  { title: "sidebar.journalPrompts", url: routes.journalPrompts.path, icon: Lightbulb },
  { title: "sidebar.journalTemplates", url: routes.journalTemplates.path, icon: LayoutTemplate },
];

const userNavItems = [
  { title: "sidebar.myDashboard", url: routes.userDashboard.path, icon: Home },
  { title: "sidebar.bible", url: routes.bibleReader.path, icon: BookText },
  { title: "sidebar.dailyVerse", url: routes.userDailyVerse.path, icon: Sun },
  { title: "sidebar.devotions", url: routes.userDevotions.path, icon: SproutIcon },
  { title: "sidebar.readingPlans", url: routes.userPlans.path, icon: BookOpen },
  { title: "sidebar.myActivity", url: routes.myActivity.path, icon: Highlighter },
  { title: "sidebar.journal", url: routes.journal.path, icon: PenLine },
];

const manageNavItems = [
  { title: "common.settings", url: routes.settings.path, icon: Plus },
];

// Map translation keys to actual strings through a helper
const getNavTitle = (t: any, key: string): string => {
  const parts = key.split('.');
  if (parts.length === 2 && t[parts[0]] && t[parts[0]][parts[1]]) {
    return t[parts[0]][parts[1]];
  }
  return key;
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { userInfo, logout } = useAuth();
  const { t, lang: currentLang, setLanguage, isLoading: langLoading, isRtl } = useLanguage();

  const isAdmin = userInfo?.userRole === 1;
  const mainNavItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (path: string) => location.pathname === path;

  const anyJournalActive =
    isAdmin && journalSubItems.some((sub) => isActive(sub.url));
  const [journalOpen, setJournalOpen] = useState(false);
  // Close journal submenu when navigating away from journal pages
  useEffect(() => {
    if (!anyJournalActive) {
      setJournalOpen(false);
    }
  }, [anyJournalActive]);

  return (
    <>
      <style>{`
        [data-sidebar="sidebar"] {
          --sidebar-background: hsl(var(--primary));
          --sidebar-foreground: hsl(var(--primary-foreground));
          --sidebar-accent: hsl(var(--primary-foreground) / 0.12);
          --sidebar-accent-foreground: hsl(var(--primary-foreground));
          --sidebar-border: hsl(var(--primary-foreground) / 0.1);
          --sidebar-ring: hsl(var(--primary-foreground) / 0.3);
        }
      `}</style>
    <Sidebar
      side={isRtl ? "right" : "left"}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn(
        isRtl ? "border-l-0" : "border-r-0",
        "transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 shrink-0 overflow-hidden rounded-xl flex items-center justify-center bg-sidebar-accent ring-1 ring-sidebar-ring">
            <img
              src={logoImage}
              alt={t.brand?.title || 'EXEGESIS'}
              className="w-12 h-12 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm font-[family-name:var(--font-heading)] truncate text-sidebar-foreground">
                {t.brand?.title}
              </h1>
              <p className="text-[11px] text-sidebar-foreground/50 font-medium tracking-wide">{t.brand?.subtitle || 'Bible'}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mx-4 bg-sidebar-border" />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "text-[10px] font-bold tracking-[0.15em] uppercase text-sidebar-foreground/40",
              collapsed && "sr-only",
            )}
          >
            {t.sidebar?.mainMenu || 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const label = getNavTitle(t, item.title);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={label}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                          isActive(item.url)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5",
                        )}
                      >
                        {/* Active indicator bar */}
                        {isActive(item.url) && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-accent-foreground rounded-full shadow-sm" />
                        )}
                        <item.icon className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                          isActive(item.url)
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground",
                        )} />
                        {!collapsed && (
                          <span className={cn(
                            "text-sm transition-all duration-200",
                            isActive(item.url) ? "font-semibold" : "font-medium",
                          )}>{label}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Journal collapsible section — admin only */}
              {isAdmin && (
                <SidebarMenuItem>
                  <Collapsible
                    open={journalOpen}
                    onOpenChange={setJournalOpen}
                    className="group/collapsible"
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={getNavTitle(t, 'sidebar.journal')}
                        isActive={anyJournalActive}
                        className={cn(
                          anyJournalActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <PenLine className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                          anyJournalActive
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/40",
                        )} />
                        {!collapsed && (
                          <>
                            <span className="text-sm font-medium flex-1 text-start">
                              {getNavTitle(t, 'sidebar.journal')}
                            </span>
                            <ChevronDown className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                              "group-data-[state=open]/collapsible:rotate-180",
                              anyJournalActive
                                ? "text-sidebar-accent-foreground/60"
                                : "text-sidebar-foreground/30",
                            )} />
                          </>
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {journalSubItems.map((subItem) => {
                          const subLabel = getNavTitle(t, subItem.title);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.url)}
                                className={cn(
                                  isActive(subItem.url)
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                    : "",
                                )}
                              >
                                <NavLink to={subItem.url} className="flex items-center gap-2.5">
                                  <subItem.icon className={cn(
                                    "w-3.5 h-3.5 shrink-0",
                                    isActive(subItem.url)
                                      ? "text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground/40",
                                  )} />
                                  <span className="text-xs">{subLabel}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel
            className={cn(
              "text-[10px] font-bold tracking-[0.15em] uppercase text-sidebar-foreground/40",
              collapsed && "sr-only",
            )}
          >
            {t.common?.manage || 'Manage'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNavItems.map((item) => {
                const label = getNavTitle(t, item.title);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={label}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                          isActive(item.url)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-0.5",
                        )}
                      >
                        {/* Active indicator bar */}
                        {isActive(item.url) && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-sidebar-accent-foreground rounded-full shadow-sm" />
                        )}
                        <item.icon className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                          isActive(item.url)
                            ? "text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/40 group-hover:text-sidebar-accent-foreground",
                        )} />
                        {!collapsed && (
                          <span className={cn(
                            "text-sm transition-all duration-200",
                            isActive(item.url) ? "font-semibold" : "font-medium",
                          )}>{label}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        {/* Language Switcher */}
        {!collapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-2 px-1 mb-2">
              <Globe className="w-3.5 h-3.5 text-sidebar-foreground/40" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-sidebar-foreground/30">
                {t.common?.language || 'Language'}
              </span>
            </div>
            <Select
              value={currentLang}
              onValueChange={(value) => setLanguage(value as Language)}
              disabled={langLoading}
            >
              <SelectTrigger className="h-9 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
                <SelectValue>
                  <span className="truncate">{LANGUAGE_NAMES[currentLang]}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_GROUPS(t).map((group) => (
                  <SelectGroup key={group.labelKey}>
                    <SelectLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50">
                      {group.label}
                    </SelectLabel>
                    {group.languages.map((code) => (
                      <SelectItem key={code} value={code} className="py-1.5 text-xs">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span>{LANGUAGE_NAMES[code]}</span>
                            {code !== 'en' && (
                              <span className="text-muted-foreground/60 text-[10px]">
                                ({getLanguageName(code, 'en')})
                              </span>
                            )}
                          </div>
                          {code === currentLang && (
                            <Check className="w-3 h-3 text-primary shrink-0" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator className="mb-3" />

        {!collapsed && userInfo && (
          <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-lg bg-sidebar-accent border border-sidebar-border">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent-foreground/15 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">
                {userInfo.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">
                {userInfo.username}
              </p>
              <p className="text-[11px] text-sidebar-foreground/50 truncate">
                {userInfo.email}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "group w-full justify-start gap-3 px-3 py-2 h-auto text-sidebar-foreground/50 hover:text-red-300 hover:bg-sidebar-accent rounded-lg transition-all duration-200",
            collapsed && "justify-center px-0",
          )}
          onClick={logout}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 text-sidebar-foreground/40 group-hover:text-red-300 transition-colors duration-200" />
          {!collapsed && (
            <span className="text-sm font-medium">
              {t.sidebar?.logout || 'Sign Out'}
            </span>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
