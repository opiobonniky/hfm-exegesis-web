import { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/components/languages/languageProvider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Menu, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '@/hooks/useTheme';
import { routes } from './Routes/routes';

/**
 * Try to match the current pathname to a route config and return its title.
 * Handles both exact matches and parameterized routes (e.g. /journal/entry/:entryId).
 */
function matchRouteTitle(pathname: string): string | null {
  // 1. Exact match first (fast path)
  for (const config of Object.values(routes)) {
    if (config.path === pathname && config.title) {
      return config.title;
    }
  }

  // 2. Parameterized routes — match by static prefix
  for (const config of Object.values(routes)) {
    if (!config.path || !config.title) continue;
    const colonIdx = config.path.indexOf(':');
    if (colonIdx === -1) continue;
    const prefix = config.path.slice(0, colonIdx);
    if (pathname.startsWith(prefix)) {
      return config.title;
    }
  }

  return null;
}

export function AppLayout() {
  const { isAuthenticated, userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const { themeMode, setThemeMode } = useTheme();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const pageTitle = useMemo(() => {
    // Try route-matching first
    const routeTitle = matchRouteTitle(location.pathname);
    if (routeTitle) return routeTitle;

    // Fallback to dashboard titles
    const isAdmin = userInfo?.userRole === 1;
    return isAdmin
      ? (t.common?.dashboard || t.sidebar?.dashboard || 'Dashboard')
      : (t.sidebar?.myDashboard || t.dashboard?.myDashboard || 'My Dashboard');
  }, [location.pathname, userInfo?.userRole, t]);

  // ── Sync browser tab title ──
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | Exegesis` : 'Exegesis';
  }, [pageTitle]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
          <header className="h-14 md:h-16 border-b border-border flex items-center px-4 lg:px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <SidebarTrigger className="me-4">
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <Menu className="w-5 h-5 md:w-10 md:h-10" />
              </Button>
            </SidebarTrigger>
            <h1 className="text-base md:text-lg font-semibold text-foreground">
              {pageTitle}
            </h1>
            <button
              onClick={() => setThemeMode(themeMode === "dark" ? "light" : "dark")}
              className="ms-auto flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-all active:scale-95"
              title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {themeMode === "dark" ? (
                <Sun className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Moon className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </header>
          <div className="flex-1 overflow-auto pb-16 md:pb-0">
            <Outlet />
          </div>
        </main>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
