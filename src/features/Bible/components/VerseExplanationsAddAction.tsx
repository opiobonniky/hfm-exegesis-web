import { Button } from "@/components/ui/button";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  onAdd: () => void;
}

export function VerseExplanationsAddAction({ onAdd }: Props) {
  return (
    <Button size="sm" onClick={onAdd} className="gap-1.5 text-xs">{tt("+ Add")}</Button>
  );
}
