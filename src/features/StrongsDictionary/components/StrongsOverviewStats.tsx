import { Languages, Library, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const OVERVIEW_ITEMS = [
  { label: "Languages", value: "Hebrew + Greek", icon: Languages },
  { label: "Study scope", value: "Bible-wide", icon: Library },
  { label: "Context", value: "Verse studies", icon: Sparkles },
];

export function StrongsOverviewStats() {
  return (
    <section className="mt-6 grid gap-3 sm:grid-cols-3">
      {OVERVIEW_ITEMS.map((item) => (
        <Card key={item.label} className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 font-semibold">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
