import { beforeEach, expect, it } from 'vitest';
import { guestRequestResult, GUEST_SESSION_KEY } from './guestSession';
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
it('does not create a guest session implicitly', () => {
  expect(guestRequestResult('bible', 'add-highlight')).toBeNull();
});
it('returns empty account reads and refuses account writes for guests', () => {
  sessionStorage.setItem(GUEST_SESSION_KEY, '1');
  expect(guestRequestResult('bible', 'get-highlights')).toMatchObject({ returnCode: 200, returnData: [] });
  expect(guestRequestResult('bible', 'add-highlight')).toMatchObject({ returnCode: 401 });
  expect(guestRequestResult('bible', 'get-todays-verse')).toBeNull();
});
it('never overrides an authenticated account request', () => {
  sessionStorage.setItem(GUEST_SESSION_KEY, '1'); localStorage.setItem('auth_token', 'valid');
  expect(guestRequestResult('bible', 'add-highlight')).toBeNull();
});
