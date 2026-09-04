// AddBookPrologueArrayField — reusable list editor for string[] fields.
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  field: string;
  values: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}

export function AddBookPrologueArrayField({
  label,
  field,
  values,
  onUpdate,
  onAdd,
  onRemove,
  placeholder,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="h-6 text-xs gap-1"
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {values.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No items yet</p>
      )}
      {values.map((val, i) => (
        <div key={`${field}-${i}`} className="flex items-center gap-2">
          <Input
            className="h-9 text-sm"
            placeholder={placeholder || `${label} ${i + 1}`}
            value={val}
            onChange={(e) => onUpdate(i, e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onRemove(i)}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
