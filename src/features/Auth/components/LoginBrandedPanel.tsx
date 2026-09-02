import { AuthBrandedPanel } from "./AuthBrandedPanel";
import { AuthHighlightText } from "./AuthHighlightText";
import type { LoginPageModel } from "../types";

type LoginBrandedPanelProps = Pick<
  LoginPageModel,
  "isRtl" | "taglineStart" | "taglineEnd" | "wordLabel" | "quote" | "attribution"
>;

export function LoginBrandedPanel({
  isRtl,
  taglineStart,
  taglineEnd,
  wordLabel,
  quote,
  attribution,
}: LoginBrandedPanelProps) {
  return (
    <AuthBrandedPanel
      isRtl={isRtl}
      tagline={
        <>
          {taglineStart}
          <AuthHighlightText text={wordLabel} />
          {taglineEnd}
        </>
      }
      quote={quote}
      attribution={attribution}
    />
  );
}
