// src/hooks/useAppNavigation.ts
import { routes } from "@/components/Routes/routes";
import { generatePath, useNavigate } from "react-router-dom";

/**
 * Custom hook for type-safe navigation using route configuration
 *
 * @example
 * const { navigateTo } = useAppNavigation();
 * navigateTo('dashboard');
 * navigateTo('editReadingPlan', { planId: '123' });
 */
export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = (
    routeKey: keyof typeof routes,
    params?: Record<string, string | number>,
    options?: { replace?: boolean; state?: any },
  ) => {
    const path = generatePath(routeKey, params);
    navigate(path, options);
  };

  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return {
    navigateTo,
    goBack,
    goForward,
    navigate, // expose the original navigate for advanced use
  };
};

/**
 * Hook to get current route information
 */
export const useCurrentRoute = () => {
  const currentPath = window.location.pathname;

  const currentRoute = Object.entries(routes).find(([_, config]) => {
    // Simple path matching - you might want to use a library like path-to-regexp for complex patterns
    const pattern = config.path.replace(/:\w+/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  });

  return currentRoute ? currentRoute[1] : null;
};
