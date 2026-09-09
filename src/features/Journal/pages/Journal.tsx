import { JournalListPageLayout } from "../components/JournalListPageLayout";
import { useJournalPageFull } from "../hooks/useJournalPageFull";

export default function Journal() {
  const { data, actions } = useJournalPageFull();

  return <JournalListPageLayout page={{ ...data, ...actions }} />;
}
