import logoImage from "@/assets/logos/exegesis_bg_rm.png";

interface RegisterBrandedPanelProps {
  firstNameLabel: string;
  signUpLabel: string;
  year: number;
}

export function RegisterBrandedPanel({ firstNameLabel, signUpLabel, year }: RegisterBrandedPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-dark">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col justify-between p-10 text-white">
        <div className="flex items-center gap-3">
          <img src={logoImage} alt="Exegesis" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>EXEGESIS</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-3 leading-tight">{firstNameLabel}</h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">{signUpLabel}</p>
        </div>
        <p className="text-white/30 text-xs">&copy; {year} Exegesis Project</p>
      </div>
    </div>
  );
}
