import BibleChapterSelectionView from "../components/BibleChapterSelection";
import { useBibleChapterSelectionPage } from "../hooks/useBibleChapterSelectionPage";

export default function BibleChapterSelection() {
  const { data, actions } = useBibleChapterSelectionPage();

  return (
    <BibleChapterSelectionView
      chapters={data.chapters}
      currentChapter={data.currentChapter}
      isRtl={data.isRtl}
      title={data.title}
      subtitle={data.subtitle}
      summaryLabel={data.summaryLabel}
      totalLabel={data.totalLabel}
      chapterLabel={data.chapterLabel}
      selectBookLabel={data.selectBookLabel}
      backLabel={data.backLabel}
      onBack={actions.goBack}
      onSelectBook={actions.selectBook}
      onSelectChapter={actions.selectChapter}
    />
  );
}
