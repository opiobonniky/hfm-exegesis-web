import { Check, X } from "lucide-react";
import { TIERS } from "./SowerTierCards";

const COMPARISON = [
  { category: "Reading", items: [{ label: "Bible Reader (all translations)", free: true, legacy: true, covenant: true }] },
  { category: "Study Tools", items: [
    { label: "Basic Search", free: true, legacy: true, covenant: true },
    { label: "Strong's / Topics / Lemma Search", free: false, legacy: true, covenant: true },
    { label: "Cross-Translation Search", free: false, legacy: true, covenant: true },
    { label: "Exegesis Lab (full 4 stages)", free: false, legacy: true, covenant: true },
    { label: "Reading Plans with progress", free: false, legacy: true, covenant: true },
  ]},
  { category: "Journaling", items: [
    { label: "Basic Notes", free: true, legacy: true, covenant: true },
    { label: "Legacy Ledger (full journal)", free: false, legacy: true, covenant: true },
    { label: "Journal Export", free: false, legacy: true, covenant: true },
  ]},
  { category: "AI & Analytics", items: [
    { label: "Explain Bible & Study Notes", free: false, legacy: true, covenant: true },
    { label: "Prayers & Reflection", free: false, legacy: false, covenant: true },
    { label: "Advanced Analytics", free: false, legacy: false, covenant: true },
    { label: "Early Access Features", free: false, legacy: false, covenant: true },
  ]},
];
export function SowerFeatureComparison() {
  return (
    <section className="bg-card border-t border-border/50 py-14">
      <div className="max-w-4xl mx-auto px-5 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">Compare Plans</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Everything you need to grow in Scripture — free and paid.</p>
        </div>
        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 pr-4 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Feature</th>
                {TIERS.map((t) => <th key={t.id} className="py-3 px-2 sm:px-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((section) => (
                <tbody key={section.category}>
                  <tr className="border-t border-border/30">
                    <td colSpan={4} className="py-2.5 text-[10px] font-black text-primary uppercase tracking-wider">{section.category}</td>
                  </tr>
                  {section.items.map((item, i) => (
                    <tr key={i} className="border-t border-border/20 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-2 sm:pr-4 text-xs sm:text-sm text-foreground">{item.label}</td>
                      {[item.free, item.legacy, item.covenant].map((inc, j) => (
                        <td key={j} className="py-2.5 px-2 sm:px-4 text-center">
                          {inc ? <Check className="w-4 h-4 mx-auto text-emerald-500" /> : <X className="w-3.5 h-3.5 mx-auto text-muted-foreground/30" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
