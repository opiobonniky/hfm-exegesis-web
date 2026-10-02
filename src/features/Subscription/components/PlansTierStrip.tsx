import { BookOpen, Gem, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, TIERS } from "./SowerTierCards";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { PlansTierStripProps } from "../types";

export function PlansTierStrip({ eyebrow, title, lead }: PlansTierStripProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-12 pt-4 pb-8 sm:pt-8 sm:pb-12 bg-background">
      <div className="w-full max-w-5xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="text-brand-primary font-black uppercase tracking-[0.25em] text-[10px] sm:text-xs">{eyebrow}</p>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tighter leading-tight text-foreground">
            {title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">{lead}</p>
        </div>

        <div className="grid gap-5 sm:gap-6 sm:grid-cols-3 items-start">
          {TIERS.map((tier, index) => {
            const Icon = tier.icon ?? BookOpen;
            const isFeatured = tier.id === "legacy_sower";
            return (
              <motion.article
                key={tier.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
                className={`relative flex flex-col rounded-3xl border p-6 sm:p-7 h-full ${
                  isFeatured
                    ? "border-brand-primary/40 bg-card shadow-xl shadow-brand-primary/10 lg:-mt-4 lg:pb-10"
                    : "border-border bg-card/60"
                }`}
              >
                {isFeatured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-primary px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-white">
                    {tt("Most Popular")}
                  </span>
                ) : null}

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isFeatured ? "bg-brand-primary/12 text-brand-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black font-[family-name:var(--font-heading)] tracking-tight text-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {tier.subtitle}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">
                    {tier.monthlyPrice === 0 ? tt("Free") : formatPrice(tier.monthlyPrice)}
                  </span>
                  {tier.monthlyPrice === 0 ? null : (
                    <span className="text-xs font-semibold text-muted-foreground">{tt("/month")}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground font-medium leading-relaxed">{tier.description}</p>

                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={`flex items-start gap-2.5 text-sm ${
                        feature.included ? "text-foreground/90" : "text-muted-foreground/50"
                      }`}
                    >
                      <span
                        className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          feature.included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60"
                        }`}
                      >
                        {tier.id === "covenant_sower" && feature.included ? (
                          <Gem className="h-2.5 w-2.5" aria-hidden="true" />
                        ) : feature.included ? (
                          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                        ) : (
                          <span className="block h-1 w-1 rounded-full bg-current" aria-hidden="true" />
                        )}
                      </span>
                      <span className="font-medium">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-auto pt-6 text-[11px] font-semibold text-muted-foreground/80">
                  {tier.monthlyPrice === 0
                    ? tt("No account required to start reading.")
                    : tier.slotLimit
                      ? tt("Limited to the first {count} supporters.").replace("{count}", String(tier.slotLimit))
                      : tt("Unlimited access, cancel anytime.")}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}