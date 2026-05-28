import {
  BookOpen,
  LayoutDashboard,
  Sun,
  BookMarked,
  Plus,
  LogOut,
  ChevronLeft,
  Users,
  Activity,
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
  { title: "sidebar.userActivity", url: routes.useractivity.path, icon: Activity },
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

  return (
    <Sidebar
      side={isRtl ? "right" : "left"}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={cn(
        isRtl ? "border-l" : "border-r",
        "border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1.5">
            <img
              src={logoImage}
              alt={t.brand?.title || 'EXEGESIS'}
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm font-[family-name:var(--font-heading)] truncate">
                {t.brand?.title}
              </h1>
              <p className="text-xl text-accent font-bold">{t.brand?.subtitle || 'Bible'}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mx-4" />

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel
            className={cn(
              "text-xs uppercase tracking-wider",
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
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive(item.url)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "hover:bg-sidebar-accent text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && (
                          <span className="font-medium">{label}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel
            className={cn(
              "text-xs uppercase tracking-wider",
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
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                          isActive(item.url)
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "hover:bg-sidebar-accent text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && (
                          <span className="font-medium">{label}</span>
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
              <Globe className="w-3.5 h-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50">
                {t.common?.language || 'Language'}
              </span>
            </div>
            <Select
              value={currentLang}
              onValueChange={(value) => setLanguage(value as Language)}
              disabled={langLoading}
            >
              <SelectTrigger className="h-9 text-xs">
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
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {userInfo.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">
                {userInfo.username}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {userInfo.email}
              </p>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0",
          )}
          onClick={logout}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="ms-3">{t.sidebar?.logout || 'Sign Out'}</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
