import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StableLoadingContent } from "./StableLoadingContent";

describe("StableLoadingContent", () => {
  it("survives Google Translate replacing a label text node", () => {
    const view = render(
      <StableLoadingContent loading={false} idle="Send Reset Code" pending="Sending..." />,
    );
    const idle = view.getByText("Send Reset Code");
    idle.replaceChildren(Object.assign(document.createElement("font"), { textContent: "Envoyer le code" }));

    expect(() => view.rerender(
      <StableLoadingContent loading idle="Send Reset Code" pending="Sending..." />,
    )).not.toThrow();
    expect(view.getByText("Sending...").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "false");
  });
});
