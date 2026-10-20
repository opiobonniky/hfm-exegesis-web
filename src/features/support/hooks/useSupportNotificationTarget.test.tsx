import { createElement, type PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSupportNotificationTarget } from './useSupportNotificationTarget';

afterEach(cleanup);
describe('support notification ticket opening', () => {
  it.each(['/support', '/admin/support'])('opens a notification ticket at %s without waiting for a list result', async path => {
    const open = vi.fn().mockResolvedValue(undefined);
    renderHook(() => useSupportNotificationTarget(open), { wrapper: ({ children }: PropsWithChildren) =>
      createElement(MemoryRouter, { initialEntries: [`${path}?ticketId=42&messageId=9`] }, children) });
    await waitFor(() => expect(open).toHaveBeenCalledWith({ id: 42 }));
    expect(open).toHaveBeenCalledTimes(1);
  });
  it('ignores malformed ticket targets', () => {
    const open = vi.fn();
    renderHook(() => useSupportNotificationTarget(open), { wrapper: ({ children }: PropsWithChildren) =>
      createElement(MemoryRouter, { initialEntries: ['/support?ticketId=-1'] }, children) });
    expect(open).not.toHaveBeenCalled();
  });
});
