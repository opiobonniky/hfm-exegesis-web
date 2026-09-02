import type { Translations } from "@/components/languages/type";
import type { JournalDetailCategoryMeta, JournalDetailEntry, JournalDetailMoodInfo, JournalDetailReflectionSection } from "../hooks/useJournalDetail";
import JournalDetailContentBlock from "./JournalDetailContentBlock";
import JournalDetailLeafDivider from "./JournalDetailLeafDivider";
import JournalDetailMetaRow from "./JournalDetailMetaRow";
import JournalDetailReflectionList from "./JournalDetailReflectionList";
import JournalDetailTagsBlock from "./JournalDetailTagsBlock";
import JournalDetailTimestamps from "./JournalDetailTimestamps";
import JournalDetailTitleBlock from "./JournalDetailTitleBlock";

export interface JournalDetailBodyProps {
  entry: JournalDetailEntry;
  t: Translations;
  category: JournalDetailCategoryMeta;
  mood: JournalDetailMoodInfo | null;
  tags: string[];
  reflectionSections: JournalDetailReflectionSection[];
  formatDate: (date: string) => string;
  formatDateShort: (date: string) => string;
}

export default function JournalDetailBody(props: JournalDetailBodyProps) {
  const categoryLabel = props.t.journal[props.category.labelKey as keyof Translations["journal"]] || props.category.label;
  return (
    <main className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
      <JournalDetailMetaRow category={props.category} categoryLabel={categoryLabel} mood={props.mood} createdOn={props.entry.createdOn} formatDate={props.formatDate} />
      <JournalDetailTitleBlock title={props.entry.title} bookName={props.entry.bookName} chapter={props.entry.chapter} verseNumber={props.entry.verseNumber} />
      <JournalDetailContentBlock content={props.entry.content} />
      <JournalDetailReflectionList sections={props.reflectionSections} />
      <JournalDetailTagsBlock tags={props.tags} />
      <JournalDetailLeafDivider />
      <JournalDetailTimestamps createdOn={props.entry.createdOn} updatedOn={props.entry.updatedOn} formatDate={props.formatDateShort} />
    </main>
  );
}
