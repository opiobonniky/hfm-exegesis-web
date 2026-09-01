import { Sun } from "lucide-react";
import { routes } from "@/components/Routes/routes";
import type { AddDailyVersePageModel } from "../hooks/useAddDailyVerse";
import { DailyContentPageHeader } from "./DailyContentPageHeader";

interface Props {
  model: AddDailyVersePageModel;
}

export function AddDailyVerseHeader({ model: h }: Props) {
  return (
    <div className="fade-up">
      <DailyContentPageHeader
        backTo={routes.dashboard.path}
        backLabel={h.t.common.back}
        icon={Sun}
        title={h.isEditing ? "Edit Daily Verse" : h.t.dailyVerse.addVerseTitle}
        subtitle={h.t.dailyVerse.addVerseSubtitle}
      />
    </div>
  );
}
