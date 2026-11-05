import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";

export function GuestReadingDialog({ message, onClose }: { message: string | null; onClose: () => void }) {
  return <Dialog open={!!message} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="rounded-2xl sm:max-w-md">
      <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><BookOpen className="size-6" /></div>
      <DialogHeader><DialogTitle>{tt("Keep growing in the Word")}</DialogTitle><DialogDescription>{tt(message || "Sign in to use this feature.")}</DialogDescription></DialogHeader>
      <p className="text-sm leading-relaxed text-muted-foreground">{tt("You can keep reading without an account. Sign in or create an account to save your reflections and use study tools.")}</p>
      <DialogFooter className="gap-2 sm:flex-col"><Button asChild><Link to="/register">{tt("Create an account")}<ArrowRight className="ms-2 size-4 rtl:rotate-180" /></Link></Button><Button asChild variant="outline"><Link to="/login">{tt("Sign in")}</Link></Button><Button variant="ghost" onClick={onClose}>{tt("Keep reading as guest")}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
