import { Navigate, Outlet, useLocation, matchPath } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "./Routes/routes";
import { isSupportNotificationPath, PENDING_SUPPORT_LINK } from '@/services/notificationRouting';

export function ProtectedRoute() {
  const { isAuthenticated, isGuest, loading, userInfo } = useAuth();
  const location = useLocation();
  const config = Object.values(routes).find(route => route.path !== '*' && matchPath(route.path, location.pathname));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-accordion-down rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isGuest && config?.allowGuest && !config.adminOnly) return <Outlet />;
    const target = `${location.pathname}${location.search}`;
    if (isSupportNotificationPath(target)) sessionStorage.setItem(PENDING_SUPPORT_LINK, target);
    return <Navigate to={routes.landing.path} replace />;
  }

  // Interlock: users on a temporary (admin-issued) password must change it
  // before they can reach any other protected page.
  const isForceChangePage = location.pathname === routes.forceChangePassword.path;
  if (userInfo?.mustChangePassword && !isForceChangePage) {
    return <Navigate to={routes.forceChangePassword.path} replace />;
  }

  const isAdmin = userInfo?.userRole === 1;
  const isAdminOnlyRoute = config?.adminOnly;

  if (isAdminOnlyRoute && !isAdmin) {
    return <Navigate to={routes.landing.path} replace />;
  }

  return <Outlet />;
}
