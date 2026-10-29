import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, it, expect } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import { routes } from './Routes/routes';

const auth = vi.hoisted(() => ({ isAuthenticated: true, isGuest: false, loading: false, userInfo: { userRole: 0, mustChangePassword: false } }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }));
function visit(path: string) {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/" element={<p>Blocked</p>} />
    <Route path="/force-change-password" element={<p>Change password</p>} />
    <Route element={<ProtectedRoute />}><Route path={path} element={<p>Allowed</p>} /></Route>
  </Routes></MemoryRouter>);
}
it.each(['/add-daily-exegesis', '/add-daily-verse', '/admin/users/123', '/edit-reading-plan/123'])('blocks ordinary users from %s', path => {
  Object.assign(auth, { isAuthenticated: true, isGuest: false, userInfo: { userRole: 0 } });
  visit(path); expect(screen.getByText('Blocked')).toBeInTheDocument();
});
it('admits an admin', () => {
  Object.assign(auth, { isAuthenticated: true, userInfo: { userRole: 1 } });
  visit('/add-daily-exegesis'); expect(screen.getByText('Allowed')).toBeInTheDocument();
});
it('allows entered guests only into explicit reading routes', () => {
  Object.assign(auth, { isAuthenticated: false, isGuest: true, userInfo: null });
  visit('/bible-reader'); expect(screen.getByText('Allowed')).toBeInTheDocument();
});
it('does not grant guests journal access', () => {
  Object.assign(auth, { isAuthenticated: false, isGuest: true, userInfo: null });
  visit('/journal'); expect(screen.getByText('Blocked')).toBeInTheDocument();
});
it('keeps the temporary-password interlock ahead of admin access', () => {
  Object.assign(auth, { isAuthenticated: true, isGuest: false, userInfo: { userRole: 1, mustChangePassword: true } });
  visit('/admin/users'); expect(screen.getByText('Change password')).toBeInTheDocument();
});
it('has no guest-enabled admin routes or duplicate configured paths', () => {
  const configs = Object.values(routes);
  expect(configs.filter(route => route.adminOnly && route.allowGuest)).toHaveLength(0);
  expect(new Set(configs.map(route => route.path)).size).toBe(configs.length);
});
