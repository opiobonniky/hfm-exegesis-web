import { FileText } from "lucide-react";

export function LabHomeEmpty() {
  return (
    <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center mb-5 ring-1 ring-border/50"><FileText className="w-10 h-10 text-muted-foreground/25" /></div>
        <h3 className="text-lg font-bold text-foreground mb-1">No studies yet</h3>
        <p className="text-sm text-muted-foreground/70 max-w-xs leading-relaxed">Start your first Bible study above to begin the 4-step journey through Scripture.</p>
      </div>
    </section>
  );
}
