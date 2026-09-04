// AddBookPrologueThemesForm — step 3: themes, key people, key verses, applications.
import { Layers } from "lucide-react";
import type { AddBookPrologueModel } from "../types";
import { AddBookPrologueArrayField } from "./AddBookPrologueArrayField";

interface Props {
  model: AddBookPrologueModel;
}

export function AddBookPrologueThemesForm({ model: h }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <Layers className="h-4 w-4" />
        <span className="text-sm font-medium">Themes & people</span>
      </div>

      <AddBookPrologueArrayField
        label="Main themes"
        field="mainThemes"
        values={h.form.mainThemes}
        onUpdate={(i, v) => h.updateArrayItem("mainThemes", i, v)}
        onAdd={() => h.addArrayItem("mainThemes")}
        onRemove={(i) => h.removeArrayItem("mainThemes", i)}
        placeholder="e.g. Covenant faithfulness"
      />

      <AddBookPrologueArrayField
        label="Key people"
        field="keyPeople"
        values={h.form.keyPeople}
        onUpdate={(i, v) => h.updateArrayItem("keyPeople", i, v)}
        onAdd={() => h.addArrayItem("keyPeople")}
        onRemove={(i) => h.removeArrayItem("keyPeople", i)}
        placeholder="e.g. Abraham"
      />

      <AddBookPrologueArrayField
        label="Key verses"
        field="keyVerses"
        values={h.form.keyVerses}
        onUpdate={(i, v) => h.updateArrayItem("keyVerses", i, v)}
        onAdd={() => h.addArrayItem("keyVerses")}
        onRemove={(i) => h.removeArrayItem("keyVerses", i)}
        placeholder="e.g. Genesis 12:1"
      />

      <AddBookPrologueArrayField
        label="Applications"
        field="applications"
        values={h.form.applications}
        onUpdate={(i, v) => h.updateArrayItem("applications", i, v)}
        onAdd={() => h.addArrayItem("applications")}
        onRemove={(i) => h.removeArrayItem("applications", i)}
        placeholder="e.g. Trust God's sovereignty"
      />
    </div>
  );
}
