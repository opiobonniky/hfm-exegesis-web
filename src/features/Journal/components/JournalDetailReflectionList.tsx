import { ReflectionSection } from "./ReflectionSection";
import JournalDetailLeafDivider from "./JournalDetailLeafDivider";
import type { JournalDetailReflectionSection } from "../hooks/useJournalDetail";

export interface JournalDetailReflectionListProps {
  sections: JournalDetailReflectionSection[];
}

export default function JournalDetailReflectionList({ sections }: JournalDetailReflectionListProps) {
  if (sections.length === 0) return null;
  return (
    <>
      <JournalDetailLeafDivider />
      <div className="space-y-8 mb-6">
        {sections.map((section) => <ReflectionSection key={section.key} {...section} />)}
      </div>
    </>
  );
}
