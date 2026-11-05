import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useDesktopNavFit } from './useDesktopNavFit';

let available = 1200;
let brand = 80;
let menu = 730;
const actions = 170;
let desktopWidth = true;
let resized: () => void;

function Harness() {
  const fit = useDesktopNavFit();
  return <div ref={el => {
    fit.rowRef.current = el;
    if (el) Object.defineProperty(el, 'clientWidth', { get: () => available, configurable: true });
  }}>
    <a ref={el => {
      fit.brandRef.current = el;
      if (el) el.getBoundingClientRect = () => ({ width: brand } as DOMRect);
    }} />
    <div ref={el => {
      fit.menuRef.current = el;
      if (el) Object.defineProperty(el, 'scrollWidth', { get: () => menu, configurable: true });
    }} />
    <div ref={el => {
      fit.actionsRef.current = el;
      if (el) Object.defineProperty(el, 'scrollWidth', { get: () => actions, configurable: true });
    }} />
    <output>{fit.desktopFits ? 'desktop' : 'mobile'}</output>
  </div>;
}

afterEach(() => vi.unstubAllGlobals());

it('uses measured content fit for long translations, scrolled branding, and viewport changes', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: desktopWidth }));
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resized = callback; }
    observe() {}
    disconnect() {}
  });
  render(<Harness />);
  expect(screen.getByText('desktop')).toBeInTheDocument();
  menu = 1000;
  act(() => resized());
  expect(screen.getByText('mobile')).toBeInTheDocument();
  menu = 730;
  brand = 300;
  act(() => resized());
  expect(screen.getByText('mobile')).toBeInTheDocument();
  available = 1500;
  act(() => resized());
  expect(screen.getByText('desktop')).toBeInTheDocument();
  desktopWidth = false;
  act(() => resized());
  expect(screen.getByText('mobile')).toBeInTheDocument();
});
