import { useTriviaPerformance } from "../hooks/useTriviaPerformance";
import { triviaPerformanceTheme as theme } from "../theme/theme";
import { TriviaPerformanceContent } from "../components/TriviaPerformanceContent";
import TriviaPerformanceHeader from "../components/TriviaPerformanceHeader";
import TriviaPerformanceState from "../components/TriviaPerformanceState";

export default function TriviaPerformance() {
  const {data, actions} = useTriviaPerformance();

  return (
    <div className={`${theme.page} relative overflow-hidden p-4 sm:p-6 lg:p-8`}>
      <main className="relative mx-auto max-w-6xl space-y-6">
        <TriviaPerformanceHeader />
        <TriviaPerformanceState loading={data.loading} error={data.error} onRetry={actions.retry} />
        {!data.loading && !data.error && (
          <TriviaPerformanceContent
            stats={data.stats}
            answers={data.answers}
            hasNext={data.hasNext}
            loadingMore={data.loadingMore}
            search={data.search}
            onSearch={actions.setSearch}
            onLoadMore={actions.loadMore}
          />
        )}
      </main>
    </div>
  );
}
