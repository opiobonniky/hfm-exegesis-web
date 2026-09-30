import { tt } from '@/components/languages/hardcodedTranslate';
export function LabFlowLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p>{tt("Loading study session...")}</p>
      </div>
    </div>
  );
}
