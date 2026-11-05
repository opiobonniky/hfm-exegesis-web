import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { LanguageProvider, useLanguage } from './languageProvider';

let pack: { stage: string; pack: object | null } = { stage: 'ready', pack: {} };
vi.mock('@/services/publicReadingPacks', () => ({
  getPublicPackState: () => pack,
  subscribePublicPacks: () => () => {},
  syncPublicPack: async () => undefined,
  getPackedUiDictionary: () => new Map(),
}));
vi.mock('./googleTranslate', () => ({
  applyGoogleLanguage: vi.fn(),
  loadGoogleTranslate: async () => undefined,
  GOOGLE_TRANSLATE_ELEMENT_ID: 'google_translate_element',
}));

function Form() {
  const { lang, setLanguage } = useLanguage();
  const [draft, setDraft] = useState('');
  return <>
    <input aria-label="Draft" value={draft} onChange={event => setDraft(event.target.value)} />
    <button onClick={() => setLanguage('fr')}>French</button>
    <button onClick={() => setLanguage('en')}>English</button>
    <output>{lang}</output>
  </>;
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.clear(); pack = { stage: 'ready', pack: {} }; });

it('switches installed languages in place without discarding a form draft', async () => {
  localStorage.setItem('exegesis-language', 'en');
  const reload = vi.fn();
  vi.stubGlobal('location', { ...window.location, reload });
  render(<MemoryRouter><LanguageProvider><Form /></LanguageProvider></MemoryRouter>);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Draft'), 'Unsaved reflection');
  await user.click(screen.getByRole('button', { name: 'French' }));
  expect(screen.getByText('fr')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'English' }));
  expect(screen.getByText('en')).toBeInTheDocument();
  expect(screen.getByLabelText('Draft')).toHaveValue('Unsaved reflection');
  expect(reload).not.toHaveBeenCalled();
});

it('does not auto-reload on fallback recovery or discard drafts after a cancelled language switch', async () => {
  localStorage.setItem('exegesis-language', 'fr');
  pack = { stage: 'failed', pack: null };
  const reload = vi.fn();
  vi.stubGlobal('location', { ...window.location, reload });
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const view = () => <MemoryRouter><LanguageProvider><Form /></LanguageProvider></MemoryRouter>;
  const { rerender } = render(view());
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Draft'), 'Still unsaved');
  pack = { stage: 'ready', pack: {} };
  rerender(view());
  await user.click(screen.getByRole('button', { name: 'English' }));
  await waitFor(() => expect(confirm).toHaveBeenCalled());
  expect(screen.getByText('fr')).toBeInTheDocument();
  expect(screen.getByLabelText('Draft')).toHaveValue('Still unsaved');
  expect(reload).not.toHaveBeenCalled();
});
