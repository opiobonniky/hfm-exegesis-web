import { useEffect, useRef } from 'react';

export function useScrollEnd(enabled: boolean, onEnd: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = ref.current;
    if (!enabled || !target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) onEnd();
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, onEnd]);
  return ref;
}
