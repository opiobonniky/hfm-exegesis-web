import { BookOpen } from "lucide-react";

export function HeroSection() {
  return (
    <div className="text-center mb-12 max-w-lg">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-3">Exegesis</h1>
      <p className="text-lg text-muted-foreground">A modern Bible study companion. Read, learn, and grow in God's Word.</p>
    </div>
  );
}
