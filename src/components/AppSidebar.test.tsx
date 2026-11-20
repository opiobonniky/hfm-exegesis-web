import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ userInfo: { userRole: 1 }, logout: vi.fn() }) }));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ t: {}, isRtl: false }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ state: 'expanded', isMobile: false, setOpenMobile: vi.fn() }),
  Sidebar: ({ children }: any) => <aside>{children}</aside>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarHeader: ({ children }: any) => <header>{children}</header>,
  SidebarFooter: ({ children }: any) => <footer>{children}</footer>,
}));
afterEach(cleanup);

it('links each admin daily-content type to its own page, without a combined menu item', () => {
  render(<MemoryRouter initialEntries={['/add-daily-devotion']}><AppSidebar /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Daily Verses' })).toHaveAttribute('href', '/admin/daily-verses');
  expect(screen.getByRole('link', { name: 'Daily Devotions' })).toHaveAttribute('href', '/daily-devotions');
  expect(screen.getByRole('link', { name: 'Daily Exegesis' })).toHaveAttribute('href', '/admin/daily-exegesis');
  expect(screen.queryByRole('link', { name: 'Daily Content' })).toBeNull();
});
