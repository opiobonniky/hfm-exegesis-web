/** Remove pre-v7 generic caches without deleting public offline pack storage. */
export async function clearLegacyPrivateCaches(): Promise<void> {
  if (!('caches' in globalThis)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => /^exegesis-api-/.test(key) || /^exegesis-(?:static-)?v[1-6]$/.test(key))
      .map(key => caches.delete(key)));
  } catch {
    // Storage can be disabled by the browser. Authentication must still clear.
  }
}
