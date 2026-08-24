// Footer section for Landing page
import { Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="py-12 border-t border-border bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>Exegesis</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          A free, open-source Bible study platform built with love for the global church.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Exegesis</span>
          <span>•</span>
          <span>Made with ❤️ for the Church</span>
        </div>
      </div>
    </footer>
  );
}
