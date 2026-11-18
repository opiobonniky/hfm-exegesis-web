import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useBibleEditions } from './useBibleEditions';

const catalog = vi.hoisted(() => vi.fn());
vi.mock('@/services/bibleApi', () => ({ bibleApi: { getTranslations: catalog } }));
const translations = [
  { id: 'French', name: 'Louis Segond', shortName: 'LSG', language: 'fr' },
  { id: 'KJV', name: 'King James Version', shortName: 'KJV', language: 'en' },
  { id: 'Berean', name: 'Berean Standard Bible', shortName: 'BSB', language: 'en' },
];
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); catalog.mockResolvedValue(translations); });
afterEach(cleanup);

it('defaults to BSB/Berean, not the first catalogue entry, and filters to the UI language', async () => {
  const { result } = renderHook(() => useBibleEditions('en'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.version).toBe('Berean');
  expect(result.current.options.map(row => row.value)).toEqual(['KJV', 'Berean']);
  expect(result.current.selectedLabel).toBe('BSB — Berean Standard Bible');
});

it('uses the preferred translation from Settings and resolves the BSB alias', async () => {
  localStorage.setItem('preferred_translation', 'KJV');
  const { result } = renderHook(() => useBibleEditions('en'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.version).toBe('KJV');
  act(() => result.current.setPreferredVersion('BSB'));
  expect(localStorage.getItem('preferred_translation')).toBe('Berean');
  expect(result.current.version).toBe('Berean');
});

it('ignores an incompatible preference and switches defaults when the UI language changes', async () => {
  localStorage.setItem('preferred_translation', 'French');
  const { result, rerender } = renderHook(({ lang }) => useBibleEditions(lang), { initialProps: { lang: 'en' } });
  await waitFor(() => expect(result.current.version).toBe('Berean'));
  act(() => result.current.setVersion('KJV'));
  expect(result.current.version).toBe('KJV');
  rerender({ lang: 'fr' });
  expect(result.current.version).toBe('French');
  expect(result.current.options.map(row => row.value)).toEqual(['French']);
});

it('preserves a saved foreign-language edition without offering foreign choices', async () => {
  const { result } = renderHook(() => useBibleEditions('en', { initialVersion: 'French', preserveVersion: true }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.version).toBe('French');
  expect(result.current.selectedLabel).toContain('Louis Segond');
  expect(result.current.options.map(row => row.value)).toEqual(['KJV', 'Berean']);
  expect(result.current.outsideLanguage).toBe(true);
});

it('syncs settings changes across mounted interfaces but leaves saved content unchanged', async () => {
  const settings = renderHook(() => useBibleEditions('en'));
  const editor = renderHook(() => useBibleEditions('en'));
  const saved = renderHook(() => useBibleEditions('en', { initialVersion: 'BSB', preserveVersion: true }));
  await waitFor(() => expect(settings.result.current.loading).toBe(false));
  await waitFor(() => expect(editor.result.current.loading).toBe(false));
  act(() => settings.result.current.setPreferredVersion('KJV'));
  expect(editor.result.current.version).toBe('KJV');
  expect(saved.result.current.version).toBe('BSB');
});

it('does not substitute an English Bible when no edition matches the UI language', async () => {
  const { result } = renderHook(() => useBibleEditions('as'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.options).toEqual([]);
  expect(result.current.version).toBe('');
});

it('can retry a failed catalogue load without changing saved content', async () => {
  catalog.mockRejectedValueOnce(new Error('offline'));
  const { result } = renderHook(() => useBibleEditions('en', { initialVersion: 'BSB', preserveVersion: true }));
  await waitFor(() => expect(result.current.error).toContain('Unable to load'));
  expect(result.current.version).toBe('BSB');
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.options).toHaveLength(2));
  expect(result.current.error).toBe('');
});
