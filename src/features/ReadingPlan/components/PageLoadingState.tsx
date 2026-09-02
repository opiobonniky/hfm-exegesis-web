// PageLoadingState — wrapper for loading state in reading plan pages
import { LoadingState } from "@/components/ui/LoadingState";

interface PageLoadingStateProps {
  message?: string;
}

export function PageLoadingState({ message }: PageLoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingState message={message} />
    </div>
  );
}
