import { BookText, FileText, Globe, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryLabel } from "../constants";

interface Props {
  hasSearch: boolean;
  currentCategory: string;
  isDiscover: boolean;
  onCreateNew: () => void;
}
export function JournalEmptyState({ hasSearch, currentCategory, isDiscover, onCreateNew }: Props) {
  const hasCategoryFilter = currentCategory !== "all";
  let title = "No journal entries yet";
  let subtitle = "Complete an Exegesis Lab session or write a journal entry.";
  let icon = <BookText className="w-10 h-10 text-muted-foreground/70" />;
  if (isDiscover && !hasSearch && !hasCategoryFilter) {
    title = "No community entries yet";
    subtitle = "Entries from other users will appear here once people start sharing.";
    icon = <Globe className="w-10 h-10 text-muted-foreground/70" />;
  } else if (hasSearch && hasCategoryFilter) {
    title = "No matching entries";
    subtitle = "Try adjusting your search or clearing filters.";
    icon = <Search className="w-10 h-10 text-muted-foreground/70" />;
  } else if (hasSearch) {
    title = "No results found";
    subtitle = "Try a different search term.";
  } else if (hasCategoryFilter) {
    title = `No ${getCategoryLabel({}, currentCategory)} entries`;
    subtitle = "Try selecting a different category.";
    icon = <FileText className="w-10 h-10 text-muted-foreground/70" />;
  }
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-20 h-20 rounded-full bg-card dark:bg-stone-900 border border-border dark:border-stone-800 flex items-center justify-center mb-5 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground dark:text-stone-200 mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground dark:text-muted-foreground/70 text-center max-w-sm mb-5">{subtitle}</p>
      {!hasSearch && !isDiscover && (
        <Button onClick={onCreateNew} className="rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground gap-2">
          <Plus className="w-4 h-4" />Create First Entry
        </Button>
      )}
    </div>
  );
}
