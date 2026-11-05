import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

/** Keep guest reading uninterrupted; account-only actions open an in-app prompt. */
export function useGuestReadingGate() {
  const { isGuest } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const requestAccount = useCallback((reason: string) => {
    if (!isGuest) return false;
    setMessage(reason);
    return true;
  }, [isGuest]);
  const protect = <Args extends unknown[], Result>(action: (...args: Args) => Result, reason = "Sign in to use study tools.") =>
    (...args: Args): Result | undefined => requestAccount(reason) ? undefined : action(...args);
  return { isGuest, message, requestAccount, protect, close: () => setMessage(null) };
}
