/**
 * AuthBrandedPanelDesktop — desktop right panel with logo, heading, and quote.
 */
import { motion } from "framer-motion";

interface AuthBrandedPanelDesktopProps {
  logoSrc: string;
  heading: string;
  quote: string;
  attribution: string;
  children?: React.ReactNode;
}

export function AuthBrandedPanelDesktop({ logoSrc, heading, quote, attribution, children }: AuthBrandedPanelDesktopProps) {
  return (
    <motion.div initial={{ x: "100%", skewX: 5 }} animate={{ x: 0, skewX: 0 }}
      className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-dark z-10">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-50 blur-[120px]" />
        <motion.div animate={{ y: [0, -100, 0], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-50 blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-20 text-center">
        <div className="space-y-16">
          <motion.div initial={{ scale: 0, rotate: -45, opacity: 0 }} animate={{ scale: 1, rotate: 3, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.8 }} className="relative inline-block group">
            <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
            <motion.div whileHover={{ rotate: 0, scale: 1.05 }}
              className="relative w-56 h-56 rounded-[3.5rem] bg-card/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center p-10 shadow-2xl transition-all duration-700">
              <img src={logoSrc} alt="Exegesis Logo" className="w-full h-full object-contain filter drop-shadow-2xl" />
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }} className="space-y-8 max-w-lg">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-white tracking-tighter leading-none">{heading}</h2>
              <motion.div initial={{ width: 0 }} animate={{ width: 96 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="h-2 bg-primary mx-auto rounded-full shadow-[0_0_20px_rgba(57,98,132,0.5)]" />
            </div>
            <blockquote className="text-2xl text-white/70 font-medium italic leading-relaxed px-4">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-xs">{attribution}</p>
          </motion.div>

          {children}
        </div>
      </div>
    </motion.div>
  );
}
