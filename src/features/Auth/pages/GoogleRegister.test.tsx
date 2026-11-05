import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AuthProvider } from '@/contexts/AuthContext';
import GoogleRegister from './GoogleRegister';

vi.mock('@/components/Routes/routes', () => ({ routes: {
  landing: { path: '/' }, login: { path: '/login' }, bibleReader: { path: '/bible-reader' },
} }));
vi.mock('@/firebaseConfiguration/config', () => ({ auth: {} }));
vi.mock('firebase/auth', () => ({ signOut: vi.fn() }));
vi.mock('@/services/api', () => ({ sendPostRequest: vi.fn().mockResolvedValue({ returnCode: 200 }) }));
vi.mock('@/services/privateCache', () => ({ clearLegacyPrivateCaches: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/services/pushService', () => ({
  disableWebPush: vi.fn(), syncPushTokenIfPermitted: vi.fn(),
  onForegroundMessage: vi.fn(() => () => {}), showLocalNotification: vi.fn(),
  getPushPermission: () => 'default',
}));
vi.mock('@/components/languages/languageProvider', () => ({ useLanguage: () => ({ t: {}, isRtl: false }) }));

afterEach(() => { localStorage.clear(); sessionStorage.clear(); });

it('renders valid Google proof through the real provider and proceeds to password setup', async () => {
  render(<MemoryRouter initialEntries={[{ pathname: '/google-register', state: {
    registrationProof: 'test-proof', email: 'maya@example.com', firstName: 'Maya', lastName: 'Reader',
  } }]}><AuthProvider><GoogleRegister /></AuthProvider></MemoryRouter>);
  expect(screen.getByText('maya@example.com')).toBeInTheDocument();
  expect(screen.getByLabelText('Username')).toHaveValue('mayareader');
  await userEvent.setup().click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByLabelText('Create Password')).toBeInTheDocument();
});

it('offers safe recovery on direct entry without Google proof inside the real provider', () => {
  render(<MemoryRouter initialEntries={['/google-register']}><AuthProvider><GoogleRegister /></AuthProvider></MemoryRouter>);
  expect(screen.getByRole('alert')).toHaveTextContent('Your Google sign-in has expired');
  expect(screen.getByRole('button', { name: 'Use different account' })).toBeInTheDocument();
});
