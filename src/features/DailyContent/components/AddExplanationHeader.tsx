import { AlertCircle, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/components/Routes/routes";
import type { AddExplanationPageModel } from "../hooks/useAddExplanation";
import { DailyContentPageHeader } from "./DailyContentPageHeader";

interface Props {
  model: AddExplanationPageModel;
}

export function AddExplanationHeader({ model: h }: Props) {
  const title = h.isEditMode
    ? `${h.t.verseExplanations.editPageTitle?.split("{")[0] || "Edit"} ${h.qBook} ${h.qCh}:${h.qVn}`
    : h.t.verseExplanations.addPageTitle;
  const subtitle = h.isEditMode
    ? h.t.verseExplanations.editPageSubtitle
    : h.t.verseExplanations.addPageSubtitle;
  const existingBadge = h.existingFound ? (
    <Badge variant="outline" className="ml-auto gap-1.5 border-amber-300 bg-amber-50 text-amber-700">
      <AlertCircle className="w-3.5 h-3.5" /> {h.t.verseExplanations.existingBadge}
    </Badge>
  ) : undefined;

  return (
    <DailyContentPageHeader
      backTo={routes.verseExplanations.path}
      backLabel={h.t.common.back}
      icon={ScrollText}
      title={title}
      subtitle={subtitle}
      rightElement={existingBadge}
    />
  );
}
