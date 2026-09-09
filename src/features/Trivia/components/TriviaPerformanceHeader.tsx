import { BarChart3 } from "lucide-react";

export default function TriviaPerformanceHeader() {
  return (
    <header className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-[#55758f] p-6 text-primary-foreground shadow-xl shadow-primary/15">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-7 w-7" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/65">Bible Trivia</p>
          <h1 className="text-2xl font-black">Your Performance</h1>
        </div>
      </div>
      <p className="mt-3 text-sm text-primary-foreground/75">
        Track your accuracy and review every trivia question you have answered.
      </p>
    </header>
  );
}
