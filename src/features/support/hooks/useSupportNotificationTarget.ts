import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Open a notification's ticket independently of list paging/filter contents. */
export function useSupportNotificationTarget(openThread: (ticket: { id: number }) => Promise<void>) {
  const { search } = useLocation();
  const opened = useRef<string>();
  useEffect(() => {
    const id = new URLSearchParams(search).get('ticketId');
    if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) { opened.current = undefined; return; }
    if (opened.current === id) return;
    opened.current = id;
    void openThread({ id: Number(id) });
  }, [search, openThread]);
}
