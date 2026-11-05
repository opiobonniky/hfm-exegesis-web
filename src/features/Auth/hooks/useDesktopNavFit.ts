import { useLayoutEffect, useRef, useState } from 'react';

/** Keep normal-flow desktop navigation only while all three clusters fit. */
export function useDesktopNavFit() {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const brandRef = useRef<HTMLAnchorElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [desktopFits, setDesktopFits] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      const brand = brandRef.current;
      const menu = menuRef.current;
      const actions = actionsRef.current;
      if (!row || !brand || !menu || !actions) return;
      // Hidden offscreen probes retain intrinsic widths at xl and above.
      const required = brand.getBoundingClientRect().width + menu.scrollWidth + actions.scrollWidth + 48;
      setDesktopFits(window.matchMedia('(min-width: 1280px)').matches && required <= row.clientWidth);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    [rowRef.current, brandRef.current, menuRef.current, actionsRef.current].forEach(el => {
      if (el) observer?.observe(el);
    });
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  return { rowRef, brandRef, menuRef, actionsRef, desktopFits };
}
