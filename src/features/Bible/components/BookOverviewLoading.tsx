import { tt } from '@/components/languages/hardcodedTranslate';

export default function BookOverviewLoading() {
  return <div className="prologue-page-shell animate-pulse" role="status" aria-label={tt('Loading overview')}>
    <div aria-hidden="true">
      <div className="mb-4 h-3 w-32 rounded bg-muted" />
      <div className="mb-3 h-12 w-2/3 rounded bg-muted" />
      <div className="mb-6 h-4 w-1/2 rounded bg-muted" />
      <div className="prologue-paper"><div className="prologue-card-grid">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="prologue-note space-y-3">
          <div className="h-5 w-1/2 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>)}
      </div></div>
    </div>
  </div>;
}
