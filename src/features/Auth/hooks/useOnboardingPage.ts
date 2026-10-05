import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/components/Routes/routes";

export function useOnboardingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goNext = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => { setSlide(s => s + 1); setTransitioning(false); }, 300);
  }, []);

  const goPrev = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => { setSlide(s => Math.max(0, s - 1)); setTransitioning(false); }, 300);
  }, []);

  const finish = useCallback(() => { navigate(routes.landing.path); }, [navigate]);

  return { data: { slide, transitioning }, actions: { goNext, goPrev, finish } };
}
