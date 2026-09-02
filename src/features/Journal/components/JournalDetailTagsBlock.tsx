import { Tag } from "lucide-react";
import JournalDetailLeafDivider from "./JournalDetailLeafDivider";

export interface JournalDetailTagsBlockProps {
  tags: string[];
}

export default function JournalDetailTagsBlock({ tags }: JournalDetailTagsBlockProps) {
  if (tags.length === 0) return null;
  return (
    <div className="mb-6">
      <JournalDetailLeafDivider />
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/70 mb-3 flex items-center gap-1.5"><Tag className="w-3 h-3" />Tags</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => <div key={tag} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted dark:bg-stone-800 text-muted-foreground dark:text-muted-foreground/70"># {tag}</div>)}
      </div>
    </div>
  );
}
