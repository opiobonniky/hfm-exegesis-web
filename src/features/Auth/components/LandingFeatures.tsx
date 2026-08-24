// Features grid for Landing page
import { BookOpen, Brain, Globe, Users, PenLine, Trophy } from "lucide-react";

const FEATURES = [
  { icon: BookOpen, title: "4-Stage Study", desc: "Look, Listen, Learn, Abide — a proven framework for deep engagement with Scripture." },
  { icon: Brain, title: "Original Languages", desc: "Explore Hebrew and Greek words with Strong's dictionary integration." },
  { icon: Globe, title: "Multi-Translation", desc: "Compare verse translations side by side to understand nuances." },
  { icon: Users, title: "Reading Plans", desc: "Follow curated daily reading plans with quizzes and reflections." },
  { icon: PenLine, title: "Personal Journal", desc: "Document your spiritual journey with prompts and mood tracking." },
  { icon: Trophy, title: "Bible Trivia", desc: "Test your knowledge with daily challenges and earn badges." },
];

export function LandingFeatures() {
  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Features</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">
            Everything You Need for Deep Study
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
