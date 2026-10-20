import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/services/api";
import { getSupportUnreadSummary } from "../services/support-service";
import type { SupportTicketDetail } from '../types';

/** Raw envelope every support socket event carries. Message events include the
 *  new message; unread/ticket events carry only the ticket summary; receipt
 *  events carry `messageIds`. */
export type SupportRealtimePayload = {
  event?: string;
  ticket?: unknown;
  message?: unknown;
  messageIds?: string[];
  ticketIds?: string[];
  unreadCount?: number;
  deliveredAt?: string;
  readAt?: string;
  at?: string;
  userId?: string;
  userOnline?: boolean;
  adminOnline?: boolean;
};

type SupportRealtimeListener = (payload: SupportRealtimePayload) => void;

type SupportRealtimeContextValue = {
  connected: boolean;
  syncThread: (ticketId: number, markRead: boolean) => Promise<{ ticket: SupportTicketDetail; presence: { userOnline: boolean; adminOnline: boolean } }>;
  userUnreadCount: number;
  adminUnreadCount: number;
  supportRevision: number;
  refreshUnread: () => Promise<void>;
  /**
   * Subscribe to raw support socket events so pages can apply the pushed
   * ticket/message directly instead of refetching. Returns an unsubscribe fn.
   */
  subscribe: (listener: SupportRealtimeListener) => () => void;
};

const SupportRealtimeContext = createContext<SupportRealtimeContextValue | null>(null);

export function SupportRealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userInfo } = useAuth();
  const [userUnreadCount, setUserUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [supportRevision, setSupportRevision] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const syncThread = useCallback((ticketId: number, markRead: boolean): Promise<{ ticket: SupportTicketDetail; presence: { userOnline: boolean; adminOnline: boolean } }> => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket?.connected) { reject(new Error('Support is offline')); return; }
      socket.timeout(5000).emit('support:sync', { ticketId, markRead }, (error: Error | null, result: any) => {
        if (error || result?.status !== 200) { reject(error || new Error(result?.message || 'Sync failed')); return; }
        const ticket = result.data as SupportTicketDetail;
        resolve({ ticket: { ...ticket, messages: ticket.messages.map(message => ({
          ...message,
          attachment: message.attachment ? new URL(message.attachment, API_BASE_URL).href : null,
        })) }, presence: result.presence });
      });
    });
  }, []);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSequence = useRef(0);
  const activeToken = useRef(userInfo?.token);
  activeToken.current = userInfo?.token;
  const eventListeners = useRef(new Set<SupportRealtimeListener>());

  const subscribe = useCallback((listener: SupportRealtimeListener) => {
    eventListeners.current.add(listener);
    return () => {
      eventListeners.current.delete(listener);
    };
  }, []);

  const broadcast = useCallback((payload: SupportRealtimePayload) => {
    eventListeners.current.forEach(listener => {
      try {
        listener(payload);
      } catch {
        // A single broken subscriber must not stop the others.
      }
    });
  }, []);

  const refreshUnread = useCallback(async () => {
    const token = userInfo?.token;
    if (!isAuthenticated || !token) return;
    const sequence = ++requestSequence.current;
    const response = await getSupportUnreadSummary();
    if (
      sequence === requestSequence.current &&
      activeToken.current === token &&
      response.returnCode === 200 &&
      response.returnData
    ) {
      setUserUnreadCount(response.returnData.userUnreadCount ?? 0);
      setAdminUnreadCount(response.returnData.adminUnreadCount ?? 0);
    }
  }, [isAuthenticated, userInfo?.token]);

  useEffect(() => {
    if (!isAuthenticated || !userInfo?.token) {
      requestSequence.current += 1;
      setUserUnreadCount(0);
      setAdminUnreadCount(0);
      return;
    }

    let socket: Socket | null = io(API_BASE_URL, {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      auth: { token: userInfo.token },
      reconnection: true,
    });
    socketRef.current = socket;

    // Debounced reconciliation for the unread badge. Message delivery itself
    // is handled by subscribers applying the payload — never by refetching.
    const invalidateSupport = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => {
        setSupportRevision(current => current + 1);
        refreshUnread().catch(() => {});
      }, 120);
    };

    const handleConnect = () => {
      setConnected(true);
      broadcast({ event: 'support:reconnect' });
      refreshUnread().catch(() => {});
    };
    const handleDisconnect = () => setConnected(false);
    const handleError = (error: Error) => {
      setConnected(false);
      console.warn('[support] Socket connection failed:', error.message);
    };

    const handleSupportEvent = (payload?: SupportRealtimePayload) => {
      const message = payload?.message as { attachment?: string } | undefined;
      broadcast(message?.attachment ? {
        ...payload,
        message: { ...message, attachment: new URL(message.attachment, API_BASE_URL).href },
      } : payload ?? {});
      invalidateSupport();
    };

    // Socket.IO is the fallback channel when browser push (FCM/VAPID) cannot
    // deliver a support reply. Only surface messages from the other party.
    const handleSupportMessage = (payload?: {
      message?: { senderId?: string; senderRole?: string };
      ticket?: { subject?: string };
    }) => {
      const fromOtherParty =
        !payload?.message?.senderId || payload.message.senderId !== userInfo?.id;
      if (fromOtherParty) {
        const isAdmin = userInfo?.userRole === 1;
        const fromUser = payload?.message?.senderRole === "user";
        window.dispatchEvent(
          new CustomEvent("support:notify", {
            detail: {
              title: isAdmin && fromUser
                ? `Support: ${payload?.ticket?.subject || "New message"}`
                : "Exegesis Support replied",
              body: "You have a new support message. Open support to read it.",
            },
          }),
        );
      }
      handleSupportEvent(payload);
    };
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      setSupportRevision(current => current + 1);
      refreshUnread().catch(() => {});
    };
    socket.on("connect", handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);
    socket.on("support:message", handleSupportMessage);
    socket.on("support:receipt", handleSupportEvent);
    socket.on("support:ticket:updated", handleSupportEvent);
    socket.on("support:unread", handleSupportEvent);
    socket.on('support:presence', broadcast);
    document.addEventListener("visibilitychange", handleVisibility);
    refreshUnread().catch(() => {});

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      socket?.off("connect", handleConnect);
      socket?.off("support:message", handleSupportMessage);
      socket?.off("support:receipt", handleSupportEvent);
      socket?.off("support:ticket:updated", handleSupportEvent);
      socket?.off("support:unread", handleSupportEvent);
      socket?.off('support:presence', broadcast);
      document.removeEventListener("visibilitychange", handleVisibility);
      socket?.disconnect();
      socketRef.current = null;
      setConnected(false);
      socket = null;
    };
  }, [isAuthenticated, userInfo?.token, userInfo?.id, userInfo?.userRole, refreshUnread, broadcast]);

  return (
    <SupportRealtimeContext.Provider
      value={{
        userUnreadCount,
        adminUnreadCount,
        supportRevision,
        refreshUnread,
        subscribe,
        connected,
        syncThread,
      }}
    >
      {children}
    </SupportRealtimeContext.Provider>
  );
}

export function useSupportRealtime() {
  const value = useContext(SupportRealtimeContext);
  if (!value) {
    throw new Error("useSupportRealtime must be used within SupportRealtimeProvider");
  }
  return value;
}
