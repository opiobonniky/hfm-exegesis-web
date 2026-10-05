import { BookOpenText, NotebookPen, Sparkles } from "lucide-react";
import { tt } from "@/components/languages/hardcodedTranslate";

interface RegisterBrandedPanelProps {
  logoSrc: string;
  title: string;
  description: string;
  year: number;
}

const benefits = [
  { icon: BookOpenText, label: "Focused Bible study" },
  { icon: NotebookPen, label: "A journal for reflection" },
  { icon: Sparkles, label: "Tools that reveal context" },
];

export function RegisterBrandedPanel({ logoSrc, title, description, year }: RegisterBrandedPanelProps) {
  return (
    <aside className="relative hidden overflow-hidden bg-brand-dark lg:flex lg:w-[44%] xl:w-[46%]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 top-1/4 size-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-24 bottom-8 size-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-between p-10 text-white xl:p-14">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-xl backdrop-blur-sm">
            <img src={logoSrc} alt="Exegesis" className="size-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-[0.14em]" style={{ fontFamily: "'Cinzel', serif" }}>{tt("EXEGESIS")}</span>
        </div>

        <div className="max-w-lg">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-primary">{tt("Your study starts here")}</p>
          <h2 className="text-4xl font-bold leading-[1.12] tracking-tight xl:text-5xl">{title}</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white/65">{description}</p>

          <div className="mt-9 space-y-3">
            {benefits.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium text-white/80">{tt(label)}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/35">&copy; {year} {tt("Exegesis Project")}</p>
      </div>
    </aside>
  );
}
