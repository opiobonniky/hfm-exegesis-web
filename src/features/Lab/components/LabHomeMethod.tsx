import { Timer } from "lucide-react";
import { STAGE_META } from "../constants";

export function LabHomeMethod() {
  return (
    <section className="bg-muted/20 border-y border-border/20">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="text-center mb-5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">The Method</p>
          <h3 className="text-base font-bold text-foreground">Four Steps to Deep Study</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STAGE_META.map(({ key, label, desc, time }, idx) => (
            <div key={key} className="group relative rounded-xl bg-card border border-border/50 p-3.5 text-center hover:border-primary/20 hover:shadow-sm transition-all">
              <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-muted-foreground/10 flex items-center justify-center"><span className="text-[9px] font-bold text-muted-foreground/40">{idx + 1}</span></div>
              <p className="text-xs font-bold text-foreground mb-0.5">{label}</p>
              <p className="text-[9px] text-muted-foreground/60 leading-4 mb-1.5">{desc}</p>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/30">
                <Timer className="w-2.5 h-2.5 text-muted-foreground/50" /><span className="text-[8px] font-semibold text-muted-foreground/60">{time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
