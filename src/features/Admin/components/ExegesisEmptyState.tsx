// ExegesisEmptyState — empty state for exegesis list
import { Feather, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  search: string;
  onAdd: () => void;
}

export function ExegesisEmptyState({ search, onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Feather className="w-12 h-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-1">No exegeses found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {search ? "Try a different search term" : "Create your first daily exegesis"}
      </p>
      {!search && (
        <Button onClick={onAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Add Exegesis
        </Button>
      )}
    </div>
  );
}
