/**
 * useAdminErrorHandler — returns a shared `handleError` function for consistent
 * toast notifications across all admin hooks.
 *
 * Usage:
 *   const { handleError } = useAdminErrorHandler();
 *   try { ... } catch (e) { handleError(e, "load users"); }
 */
import { useToast } from "@/hooks/use-toast";

export function useAdminErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, context: string) => {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    console.error(`[Admin] ${context}:`, error);

    toast({
      title: `Failed to ${context}`,
      description: message,
      variant: "destructive",
    });
  };

  return { handleError };
}
