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

type SupportRealtimeContextValue = {
  userUnreadCount: number;
  adminUnreadCount: number;
  supportRevision: number;
  refreshUnread: () => Promise<void>;
};

const SupportRealtimeContext = createContext<SupportRealtimeContextValue | null>(null);

export function SupportRealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userInfo } = useAuth();
  const [userUnreadCount, setUserUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [supportRevision, setSupportRevision] = useState(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSequence = useRef(0);
  const activeToken = useRef(userInfo?.token);
  activeToken.current = userInfo?.token;

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

    const invalidateSupport = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => {
        setSupportRevision(current => current + 1);
        refreshUnread().catch(() => {});
      }, 120);
    };

    const handleConnect = () => refreshUnread().catch(() => {});

    // Socket.IO is the fallback channel when browser push (FCM/VAPID) cannot
    // deliver a support reply. Only surface messages from the other party.
    const handleSupportMessage = (payload?: {
      message?: { senderId?: string; senderRole?: string };
      ticket?: { subject?: string };
    }) => {
      if (payload?.message?.senderId && payload.message.senderId === userInfo?.id) {
        invalidateSupport();
        return;
      }
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
      invalidateSupport();
    };
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      setSupportRevision(current => current + 1);
      refreshUnread().catch(() => {});
    };
    socket.on("connect", handleConnect);
    socket.on("support:message", handleSupportMessage);
    socket.on("support:receipt", invalidateSupport);
    socket.on("support:ticket:updated", invalidateSupport);
    socket.on("support:unread", invalidateSupport);
    document.addEventListener("visibilitychange", handleVisibility);
    refreshUnread().catch(() => {});

    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      socket?.off("connect", handleConnect);
      socket?.off("support:message", handleSupportMessage);
      socket?.off("support:receipt", invalidateSupport);
      socket?.off("support:ticket:updated", invalidateSupport);
      socket?.off("support:unread", invalidateSupport);
      document.removeEventListener("visibilitychange", handleVisibility);
      socket?.disconnect();
      socket = null;
    };
  }, [isAuthenticated, userInfo?.token, userInfo?.id, userInfo?.userRole, refreshUnread]);

  return (
    <SupportRealtimeContext.Provider
      value={{
        userUnreadCount,
        adminUnreadCount,
        supportRevision,
        refreshUnread,
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
