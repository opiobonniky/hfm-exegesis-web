/**
 * AuthMobileLogo — mobile logo section for Auth pages.
 */
interface AuthMobileLogoProps {
  src: string;
  appName?: string;
}

export function AuthMobileLogo({ src, appName = "EXEGESIS" }: AuthMobileLogoProps) {
  return (
    <div className="lg:hidden flex items-center gap-3 mb-8">
      <img src={src} alt="Exegesis" className="w-8 h-8 rounded-lg" />
      <span className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{appName}</span>
    </div>
  );
}
