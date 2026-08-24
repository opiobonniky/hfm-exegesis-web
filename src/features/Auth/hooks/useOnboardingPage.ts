import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useOnboardingPage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const goNext = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => { setSlide(s => s + 1); setTransitioning(false); }, 300);
  }, []);
  const goPrev = useCallback(() => {
    setTimeout(() => { setSlide(s => Math.max(0, s - 1)); setTransitioning(false); }, 300);
  const finish = useCallback(() => { navigate("/user-dashboard"); }, [navigate]);
  return { slide, transitioning, goNext, goPrev, finish };
}
