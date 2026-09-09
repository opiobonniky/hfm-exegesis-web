// DailyExegesis — daily exegesis reader page (thin compositor, no logic)
import { useDailyExegesisPage } from "../hooks/useDailyExegesisPage";
import {
  ExegesisHero,
  ExegesisContent,
  ExegesisHeader,
  DailyExegesisLoading,
  DailyExegesisActions,
  DailyExegesisFooter,
  DailyExegesisLayout,
  DailyExegesisError,
} from "../components";

export default function DailyExegesisPage() {
  const { data, actions } = useDailyExegesisPage();

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={data.isRtl ? "rtl" : "ltr"}>
      <ExegesisHeader onBack={actions.goBack} title={data.title} subtitle={data.subtitle} />
      {data.loading ? <DailyExegesisLoading /> : (
        <>
          <ExegesisHero
            item={data.item}
            series={data.series}
            onSelect={actions.selectSeriesItem}
            onOpenBible={actions.openInBible}
            displayDate={data.displayDate}
            isUpcoming={data.isUpcoming}
            canOpenBible={data.canOpenBible}
          />
          <DailyExegesisLayout>
            {data.error && <DailyExegesisError message={data.error} onRetry={actions.refresh} />}
            <ExegesisContent item={data.item} />
            <DailyExegesisActions
              canOpenBible={data.canOpenBible}
              onOpenBible={actions.openInBible}
              onSaveToJournal={actions.saveToLedger}
            />
          </DailyExegesisLayout>
          <DailyExegesisFooter />
        </>
      )}
    </div>
  );
}
