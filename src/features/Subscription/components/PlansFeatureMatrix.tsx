import { Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { PlansFeatureMatrixProps } from "../types";

export function PlansFeatureMatrix({
  eyebrow,
  title,
  lead,
  categories,
  tierNames,
  featuredTierIndex,
}: PlansFeatureMatrixProps) {
  return (
    <section className="relative px-4 sm:px-6 lg:px-12 pt-10 sm:pt-12 pb-4 sm:pb-8 bg-background">
      <div className="w-full max-w-5xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="text-brand-primary font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs">{eyebrow}</p>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tighter leading-tight text-foreground">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">{lead}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed border-collapse">
              <caption className="sr-only">{title}</caption>
              <colgroup>
                <col className="w-[46%] sm:w-[42%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="bg-brand-primary/[0.06]">
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-4 text-left align-bottom text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    {tt("Feature")}
                  </th>
                  {tierNames.map((name, index) => (
                    <th
                      key={name}
                      scope="col"
                      className={`px-2 sm:px-3 py-4 text-center align-bottom text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] ${
                        index === featuredTierIndex ? "text-brand-primary" : "text-muted-foreground"
                      }`}
                    >
                      <span className="block leading-tight">{name}</span>
                      {index === featuredTierIndex ? (
                        <span className="mt-1.5 inline-block rounded-full bg-brand-primary px-2 py-0.5 text-[8px] font-black tracking-[0.15em] text-white">
                          {tt("Popular")}
                        </span>
                      ) : null}
                    </th>
                  ))}
                </tr>
              </thead>
              {categories.map((group) => (
                <tbody key={group.category}>
                  <tr>
                    <th
                      colSpan={4}
                      scope="colgroup"
                      className="bg-muted/60 px-4 sm:px-6 py-2.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary"
                    >
                      {group.category}
                    </th>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.label} className="border-t border-border/60 transition-colors hover:bg-muted/40">
                      <th
                        scope="row"
                        className="px-4 sm:px-6 py-3 text-left align-middle text-xs sm:text-sm font-semibold text-foreground"
                      >
                        {item.label}
                      </th>
                      {[item.free, item.legacy, item.covenant].map((included, index) => (
                        <td key={`${item.label}-${index}`} className="px-2 sm:px-3 py-3 text-center align-middle">
                          {included ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                              <span className="sr-only">{tt("Included")}</span>
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                              <Minus className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
                              <span className="sr-only">{tt("Not included")}</span>
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-[11px] sm:text-xs text-muted-foreground/80">
          {tt("Feature access varies by plan and may change as new study tools are added.")}
        </p>
      </div>
    </section>
  );
}