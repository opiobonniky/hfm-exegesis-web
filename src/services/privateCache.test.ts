import { beforeEach, expect, it, vi } from 'vitest';
import { clearLegacyPrivateCaches } from './privateCache';
beforeEach(() => vi.unstubAllGlobals());
it('purges generic old API caches without removing public downloads or other apps', async () => {
  const remove = vi.fn(async (_name: string) => true);
  vi.stubGlobal('caches', { keys: async () => ['exegesis-api-v6', 'exegesis-v6', 'exegesis-public-packs-v1', 'another-app'], delete: remove });
  await clearLegacyPrivateCaches();
  expect(remove.mock.calls.map(call => call[0])).toEqual(['exegesis-api-v6', 'exegesis-v6']);
});
it('does not block logout when browser storage fails', async () => {
  vi.stubGlobal('caches', { keys: async () => { throw new Error('disabled'); } });
  await expect(clearLegacyPrivateCaches()).resolves.toBeUndefined();
});
