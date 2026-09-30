import { tt } from '@/components/languages/hardcodedTranslate';
export function LabReviewLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{tt("Loading study review...")}</p>
      </div>
    </div>
  );
}
