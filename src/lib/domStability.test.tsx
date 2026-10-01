import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { installDomStabilityGuards } from "./domStability";

installDomStabilityGuards();

/**
 * Mimics what the Google Translate widget actually does to a text node
 * (verified in-browser with a MutationObserver): it *removes* the original
 * text node and substitutes a `<font>` wrapper holding the translation, so the
 * node React still holds a reference to ends up detached.
 */
function googleTranslateText(host: Element, translated: string): void {
  const original = host.firstChild;
  if (!original || original.nodeType !== 3) return;
  const wrapper = document.createElement("font");
  wrapper.setAttribute("dir", "auto");
  wrapper.style.verticalAlign = "inherit";
  wrapper.textContent = translated;
  host.replaceChild(wrapper, original);
}

/** The older widget behaviour: re-parent the original text node into a `<font>`. */
function googleReparentText(host: Element, translated: string): void {
  const original = host.firstChild;
  if (!original || original.nodeType !== 3) return;
  const wrapper = document.createElement("font");
  host.removeChild(original);
  wrapper.append(original, document.createTextNode(translated));
  host.appendChild(wrapper);
}

describe("installDomStabilityGuards", () => {
  it("is idempotent", () => {
    expect(() => {
      installDomStabilityGuards();
      installDomStabilityGuards();
    }).not.toThrow();
  });

  it("does not throw when React removes a node Google already detached", () => {
    const host = document.createElement("p");
    const text = document.createTextNode("Profile");
    host.appendChild(text);

    const wrapper = document.createElement("font");
    wrapper.textContent = "Profil";
    host.replaceChild(wrapper, text);

    // Exactly what React does: remove the text node it still remembers.
    expect(host.removeChild(text)).toBe(text);
    expect(wrapper.parentNode).toBe(host);
  });

  it("removes a re-parented text node from the wrapper Google moved it into", () => {
    const host = document.createElement("p");
    const text = document.createTextNode("Save changes");
    host.appendChild(text);

    const wrapper = document.createElement("font");
    host.removeChild(text);
    wrapper.appendChild(text);
    host.appendChild(wrapper);

    expect(host.removeChild(text)).toBe(text);
    expect(wrapper.parentNode).toBeNull();
  });

  it("still removes ordinary children the normal way", () => {
    const host = document.createElement("div");
    const child = document.createElement("span");
    host.appendChild(child);

    expect(host.removeChild(child)).toBe(child);
    expect(host.childNodes).toHaveLength(0);
  });

  it("appends when the insert reference node is no longer a child", () => {
    const host = document.createElement("div");
    const other = document.createElement("div");
    const reference = document.createElement("span");
    other.appendChild(reference);

    const node = document.createElement("b");
    host.insertBefore(node, reference);

    expect(node.parentNode).toBe(host);
    expect(() => host.insertBefore(document.createElement("i"), reference)).not.toThrow();
  });

  it("lets React delete a translated text node from a surviving parent", () => {
    let visible = true;
    const { container, rerender } = render(<div>{visible ? "Profile" : null}</div>);
    googleTranslateText(container.firstElementChild!, "Profil");
    visible = false;

    expect(() => rerender(<div>{visible ? "Profile" : null}</div>)).not.toThrow();
  });

  it("survives React clearing a host whose only child Google had translated", () => {
    let visible = true;
    const { container, rerender } = render(<div>{visible ? "Profile" : null}</div>);
    const host = container.firstElementChild!;
    googleTranslateText(host, "Profil");
    visible = false;

    // React deletes the text node *and* resets the host's textContent, which
    // drops the <font> wrapper too. That is React's own contract, and the
    // commit still has to complete without throwing.
    expect(() => rerender(<div>{visible ? "Profile" : null}</div>)).not.toThrow();
    expect(host.textContent).toBe("");
  });

  it("lets React swap a Google-translated settings tab panel", () => {
    function Panel({ tab }: { tab: string }) {
      return (
        <div>
          {tab === "profile" ? (
            <section>
              <h3>Profile</h3>
              <p>Update your details</p>
            </section>
          ) : (
            <section>
              <h3>Password</h3>
              <p>Change your password</p>
            </section>
          )}
        </div>
      );
    }

    const { container, rerender, unmount } = render(<Panel tab="profile" />);
    googleTranslateText(container.querySelector("h3")!, "Profil");
    googleReparentText(container.querySelector("p")!, "Mettez a jour vos coordonnees");

    expect(() => rerender(<Panel tab="password" />)).not.toThrow();
    expect(container.textContent).toContain("Password");
    expect(() => unmount()).not.toThrow();
  });
});
