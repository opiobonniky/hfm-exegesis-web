import { beforeEach, describe, expect, it, vi } from 'vitest';
import api, { sendGetRequest, sendPostRequest } from './api';

describe('web prose translation boundary', () => {
  const adapter = vi.fn(async config => ({
    status: 200, statusText: 'OK', headers: {}, config,
    data: { success: true, data: {} },
  }));
  beforeEach(() => {
    adapter.mockClear();
    api.defaults.adapter = adapter;
    localStorage.clear();
    localStorage.setItem('exegesis-language', 'hi');
  });

  it('requests English source prose for Google instead of backend translation', async () => {
    await sendPostRequest('bible', 'get-verse-explanation', { bookName: 'Psalms', lang: 'hi' });
    expect(JSON.parse(adapter.mock.calls[0][0].data).lang).toBe('en');
    await sendGetRequest('strongs', 'search', { language: 'Hebrew', lang: 'hi' });
    expect(adapter.mock.calls[1][0].params).toMatchObject({ lang: 'en', language: 'Hebrew' });
  });

  it('preserves mutation payloads that explicitly opt out of language handling', async () => {
    await sendPostRequest('journal', 'save', { notes: 'मेरे नोट्स' }, { includeLanguage: false });
    expect(JSON.parse(adapter.mock.calls[0][0].data)).toEqual({ notes: 'मेरे नोट्स' });
  });
});
