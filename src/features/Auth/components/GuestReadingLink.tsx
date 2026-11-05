import { BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tt } from "@/components/languages/hardcodedTranslate";

export function GuestReadingLink({ disabled = false }: { disabled?: boolean }) {
  const { startGuest } = useAuth();
  return <button type="button" disabled={disabled} onClick={startGuest} className="mx-auto flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
    <BookOpen className="size-4" />{tt("Continue as guest")}<ArrowRight className="size-4 rtl:rotate-180" />
  </button>;
}
