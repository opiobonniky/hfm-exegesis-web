import { JournalListPageLayout } from "../components/JournalListPageLayout";
import { useJournalPageFull } from "../hooks/useJournalPageFull";

export default function Journal() {
  const page = useJournalPageFull();

  return <JournalListPageLayout page={page} />;
}
