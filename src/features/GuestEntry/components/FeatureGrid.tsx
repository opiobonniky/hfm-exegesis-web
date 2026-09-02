import { Card, CardContent } from "@/components/ui/card";
import { FEATURES } from "../constants";

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
      {FEATURES.map((feature) => (
        <Card key={feature.title} className="transition-all hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.bg}`}>
              <feature.icon className={`h-5 w-5 ${feature.color}`} />
            </div>
            <div>
              <p className="font-medium text-sm">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
