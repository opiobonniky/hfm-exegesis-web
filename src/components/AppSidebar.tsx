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
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routes } from "./Routes/routes";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

const adminNavItems = [
  { title: "Dashboard", url: routes.dashboard.path, icon: LayoutDashboard },
  { title: "User Management", url: routes.systemUsers.path, icon: Users },
  { title: "Bible Reader", url: routes.bibleReader.path, icon: BookText },
  { title: "Daily Verse", url: routes.dailyVerse.path, icon: Sun },
  {
    title: "Verse Explanations",
    url: routes.verseExplanations.path,
    icon: BookMarked,
  },
  { title: "Readings Plan", url: routes.readingPlans.path, icon: BookOpen },
  { title: "My Activity", url: routes.myActivity.path, icon: Highlighter },
  { title: "User Activity", url: routes.useractivity.path, icon: Activity },
];

const userNavItems = [
  { title: "My Dashboard", url: routes.userDashboard.path, icon: Home },
  { title: "Bible Reader", url: routes.bibleReader.path, icon: BookText },
  { title: "Daily Verse", url: routes.userDailyVerse.path, icon: Sun },

  { title: "Reading Plans", url: routes.userPlans.path, icon: BookOpen },
  { title: "My Activity", url: routes.myActivity.path, icon: Highlighter },
];

const manageNavItems = [
  { title: "Settings", url: routes.settings.path, icon: Plus },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { userInfo, logout } = useAuth();

  const isAdmin = userInfo?.userRole === 1;
  const mainNavItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden p-1.5">
            <img
              src={logoImage}
              alt="Exegesis"
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm font-[family-name:var(--font-heading)] truncate">
                EXEGESIS
              </h1>
              <p className="text-xl text-accent font-bold">Bible</p>
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
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
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
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
            Manage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
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
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <Separator className="mb-4" />

        {!collapsed && userInfo && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
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
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
