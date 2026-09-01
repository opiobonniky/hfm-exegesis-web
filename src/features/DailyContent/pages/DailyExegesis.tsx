// DailyExegesis — daily exegesis reader page (thin compositor, no logic)
import { useDailyExegesisPage } from "../hooks/useDailyExegesisPage";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ExegesisHero,
  ExegesisContent,
  ExegesisHeader,
  DailyExegesisLoading,
  DailyExegesisActions,
  DailyExegesisFooter,
  DailyExegesisLayout,
  DailyExegesisPageLayout,
} from "../components";

export default function DailyExegesisPage() {
  const h = useDailyExegesisPage();

  if (h.loading) {
    return (
      <DailyExegesisPageLayout isRtl={h.isRtl}>
        <ExegesisHeader onBack={h.goBack} t={h.t} />
        <DailyExegesisLoading />
      </DailyExegesisPageLayout>
    );
  }

  return (
    <DailyExegesisPageLayout isRtl={h.isRtl}>
      <ExegesisHeader onBack={h.goBack} t={h.t} />

      <ExegesisHero
        item={h.item}
        series={h.series}
        onSelect={() => {}}
        onOpenBible={h.openInBible}
        displayDate={h.displayDate}
        isUpcoming={h.isUpcoming}
        canOpenBible={h.canOpenBible}
      />

      <main className="flex-1 overflow-y-auto">
        <DailyExegesisLayout>
          {h.error && (
            <Button
              variant="outline"
              onClick={h.refresh}
              className="w-full mb-4 flex items-center gap-2 justify-center"
            >
              <RefreshCcw className="w-4 h-4" /> {h.error}
            </Button>
          )}
          <ExegesisContent item={h.item} />
          <DailyExegesisActions
            canOpenBible={h.canOpenBible}
            onOpenBible={h.openInBible}
            onSaveToJournal={h.saveToLedger}
          />
        </DailyExegesisLayout>
      </main>

      <DailyExegesisFooter />
    </DailyExegesisPageLayout>
  );
}
