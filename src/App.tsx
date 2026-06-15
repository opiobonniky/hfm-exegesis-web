import { Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/components/languages/languageProvider";
import { AppLayout } from "@/components/AppLayout";
import PublicLayout from "@/components/PublicLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import {
  getLayoutRoutes,
  getPublicRoutes,
  getPublicLayoutRoutes,
  routes,
} from "./components/Routes/routes";

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading || isNavigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const publicRoutes = getPublicRoutes();
  const publicLayoutRoutes = getPublicLayoutRoutes();
  const layoutRoutes = getLayoutRoutes();
  const notFoundRoute = routes.notFound;

  // Get protected routes that don't require layout (like dailyReading)
  const noLayoutRoutes = Object.values(routes).filter(
    (route) => route.isProtected && !route.requiresLayout,
  );

  return (
    <AuthLoader>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<route.component />}
            />
          ))}
          {/* Public routes with PublicLayout */}
          {publicLayoutRoutes.length > 0 && (
            <Route element={<PublicLayout />}>
              {publicLayoutRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
            </Route>
          )}
          <Route element={<ProtectedRoute />}>
            {/* Routes that use AppLayout */}
            <Route element={<AppLayout />}>
              {layoutRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component />}
                />
              ))}
            </Route>
            {/* Protected routes without layout */}
            {noLayoutRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Route>
          <Route
            path={notFoundRoute.path}
            element={<notFoundRoute.component />}
          />
        </Routes>
      </Suspense>
    </AuthLoader>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
