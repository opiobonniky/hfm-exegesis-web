import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS } from "./SowerTierCards";

export function SowerFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-14 bg-background">
      <div className="max-w-3xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground">Everything you need to know about sowing.</p>
        </div>
        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors">
                  <span className="text-xs sm:text-sm font-semibold text-foreground flex-1 leading-relaxed">{faq.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && <div className="px-4 pb-4"><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
