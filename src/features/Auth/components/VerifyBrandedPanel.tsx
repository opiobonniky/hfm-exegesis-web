import logoImage from "@/assets/logos/exegesis_bg_rm.png";

interface VerifyBrandedPanelProps {
  bibleLabel: string;
  lampQuote: string;
  psalmReference: string;
  startJourneyLabel: string;
}

export function VerifyBrandedPanel({ bibleLabel, lampQuote, psalmReference, startJourneyLabel }: VerifyBrandedPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute top-1/2 -right-24 w-[360px] h-[360px] bg-card/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "1s" }} />
        <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 flex flex-col justify-between px-14 py-14 w-full">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-card flex items-center justify-center shrink-0 overflow-hidden p-1.5">
            <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
          </div>
          <span className="text-white/80 font-medium tracking-widest text-3xl uppercase">{bibleLabel}</span>
        </div>

        <div className="flex flex-col items-center text-center gap-8">
          <div className="relative">
            <div className="relative w-[28rem] h-[28rem] rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.15)] flex items-center justify-center p-8">
              <img src={logoImage} alt="Exegesis Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
          <div>
            <blockquote className="text-lg lg:text-xl text-white/85 font-[family-name:var(--font-heading)] leading-relaxed max-w-sm mx-auto italic">
              &ldquo;{lampQuote}&rdquo;
            </blockquote>
            <p className="text-white/55 text-sm mt-2 tracking-wider">&mdash; {psalmReference}</p>
          </div>
        </div>

        <div>
          <p className="text-white/70 text-sm">{startJourneyLabel}</p>
        </div>
      </div>
    </div>
  );
}
