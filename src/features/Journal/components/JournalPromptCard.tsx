import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

interface JournalPromptCardProps {
  prompt: string;
  onSelect: (prompt: string) => void;
}

export function JournalPromptCard({ prompt, onSelect }: JournalPromptCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={() => onSelect(prompt)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="flex-1 text-sm text-foreground line-clamp-2">{prompt}</p>
        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
}
