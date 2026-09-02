import { User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/components/Routes/routes";

interface EmptyStateProps {
  onGoBack: () => void;
}

export function EmptyState({ onGoBack }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <User className="h-12 w-12 text-muted-foreground" />
      <span className="text-xl font-semibold">User Not Found</span>
      <span className="text-muted-foreground">
        This user hasn't answered any trivia questions yet.
      </span>
      <Button variant="outline" onClick={onGoBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trivia
      </Button>
    </div>
  );
}
