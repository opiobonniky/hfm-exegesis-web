import { Button } from "@/components/ui/button";

interface Props {
  onAdd: () => void;
}

export function VerseExplanationsAddAction({ onAdd }: Props) {
  return (
    <Button size="sm" onClick={onAdd} className="gap-1.5 text-xs">
      + Add
    </Button>
  );
}
