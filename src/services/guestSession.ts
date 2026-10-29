export const GUEST_SESSION_KEY = 'exegesis-guest-session';
export const hasGuestSession = () => {
  try { return sessionStorage.getItem(GUEST_SESSION_KEY) === '1'; }
  catch { return false; }
};

const privateBibleReads = new Set(['get-highlights', 'get-favorites', 'get-verse-note', 'get-read-history', 'get-last-read-position']);
const publicBibleReads = new Set(['get-verse-explanation', 'get-all-verses-explanation', 'get-verse-by-date', 'get-todays-verse', 'get-todays-devotion', 'get-todays-exegesis', 'get-daily-verse-by-ref', 'get-devotion-by-date', 'get-exegesis-by-date', 'get-all-daily-devotions', 'get-all-daily-exegesis', 'journal-prompts']);

export function guestRequestResult(controller: string, request: string) {
  if (!hasGuestSession() || localStorage.getItem('auth_token') || controller !== 'bible') return null;
  if (publicBibleReads.has(request)) return null;
  if (privateBibleReads.has(request)) return {
    success: true, returnCode: 200,
    returnData: request === 'get-last-read-position' ? null : [],
  };
  return { success: false, returnCode: 401, returnMessage: 'Sign in to save your reading activity, notes, favorites, and highlights.' };
}
