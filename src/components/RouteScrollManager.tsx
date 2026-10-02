import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_ROOT_SELECTOR = "[data-scroll-root]";

export function RouteScrollManager() {
  const { pathname, state } = useLocation();

  useLayoutEffect(() => {
    const requestedSection = (state as { scrollTo?: string } | null)?.scrollTo;
    if (requestedSection) return;
    if (typeof window === "undefined") return;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelectorAll<HTMLElement>(SCROLL_ROOT_SELECTOR).forEach((element) => {
      element.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname, state]);

  return null;
}