import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminDeletedUsers from './AdminDeletedUsers';
const mocks = vi.hoisted(() => ({ useUsers: vi.fn() }));
vi.mock('../hooks/useAdminUsers', () => ({ useAdminUsers: mocks.useUsers }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
it('requests the deleted-only archive and never offers activation or edit actions', () => {
  mocks.useUsers.mockReturnValue({ data: { users: [{ id: 'archived', firstName: 'Deleted', lastName: 'Reader', email: 'deleted+id@exegesis.invalid', createdOn: '2026-11-17T12:00:00Z' }], search: '', loading: false, sentinelRef: { current: null } }, actions: { setSearch: vi.fn() } });
  render(<MemoryRouter><AdminDeletedUsers /></MemoryRouter>);
  expect(mocks.useUsers).toHaveBeenCalledWith('deleted');
  expect(screen.getByText('Deleted Reader')).toBeInTheDocument();
  expect(screen.getByText('Nov 17, 2026')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /activate|delete|edit|role/i })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to User Management' })).toHaveAttribute('href', '/admin/users');
});
