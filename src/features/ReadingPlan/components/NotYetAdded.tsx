import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

export function NotYetAdded({ onBack }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Not yet configured</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        This day's reading assignment has not been added yet. Check back later.
      </p>
      <Button variant="outline" onClick={onBack}>Go Back</Button>
    </div>
  );
}
