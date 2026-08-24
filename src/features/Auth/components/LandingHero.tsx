// Hero section with daily verse for Landing page
import { BookOpen, ArrowRight, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingHeroProps {
  dailyVerse?: { reference: string; text: string } | null;
  lang: string;
  onLanguageChange: (lang: string) => void;
}
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "ha", label: "Hausa", flag: "🇳🇬" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];
export function LandingHero({ dailyVerse, lang, onLanguageChange }: LandingHeroProps) {
  const navigate = useNavigate();
  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary/10 to-accent/5 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }} />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Language selector */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Globe className="w-3 h-3 text-muted-foreground" />
          <div className="flex gap-1.5">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  lang === l.code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight tracking-tight">
          Deep Bible Study,{" "}
          <span className="text-primary">Made Personal</span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
          Explore Scripture with original languages, commentaries, and guided study plans — all in one place.
        </p>
        {/* Daily verse */}
        {dailyVerse && (
          <div className="mt-8 max-w-lg mx-auto p-4 rounded-2xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Verse of the Day</span>
            </div>
            <p className="text-sm italic text-foreground/80 leading-relaxed">"{dailyVerse.text}"</p>
            <p className="text-xs font-semibold text-primary mt-2">— {dailyVerse.reference}</p>
        )}
        {/* CTA */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
            className="px-6 py-3 rounded-xl border border-border bg-background font-semibold text-sm hover:bg-muted/50 transition-all"
            Sign In
    </section>
  );
