import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  billingInterval: "month" | "year";
  setBillingInterval: (v: "month" | "year") => void;
}
export function SowerHero({ billingInterval, setBillingInterval }: Props) {
  return (
    <section className="relative bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 py-16 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-violet-300/20 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/10 backdrop-blur-sm border border-card/20 mb-6">
          <BookOpen className="w-4 h-4 text-violet-200" />
          <span className="text-xs font-bold text-violet-100 uppercase tracking-wider">Support the Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight px-4">
          Sow into the Word
        </h1>
        <p className="text-base sm:text-xl text-violet-200 max-w-2xl mb-2 font-medium px-4">
          The Word remains free. Your support makes the mission possible.
        </p>
        <p className="text-xs sm:text-sm text-violet-300/70 max-w-xl italic mb-8 px-4">
          "Whoever sows sparingly will also reap sparingly, and whoever sows bountifully will also reap bountifully."
          <br />
          <span className="text-xs text-violet-300/50">— 2 Corinthians 9:6</span>
        </p>
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingInterval("month")}
            className={cn("px-5 py-2 rounded-full text-sm font-bold transition-all",
              billingInterval === "month" ? "bg-card text-violet-900 shadow-lg" : "bg-card/10 text-violet-200 hover:bg-card/20")}
          >Monthly</button>
          <button
            onClick={() => setBillingInterval("year")}
            className={cn("px-5 py-2 rounded-full text-sm font-bold transition-all",
              billingInterval === "year" ? "bg-card text-violet-900 shadow-lg" : "bg-card/10 text-violet-200 hover:bg-card/20")}
          >
            Yearly<span className="ml-1.5 text-[10px] font-semibold opacity-70">~20% off</span>
          </button>
        </div>
      </div>
    </section>
  );
}
