import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import WaveformAnimation, {
  __test__ensureKeyframesInjected,
} from "./WaveformAnimation";

// ── Helpers ──

function getBars(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(".waveform-bar-reusable");
}

function getContainer(container: HTMLElement): Element | null {
  return container.querySelector("[aria-hidden='true']");
}

function getKeyframesStyle(): HTMLStyleElement | null {
  return document.getElementById("waveform-animation-keyframes") as HTMLStyleElement | null;
}

// ── Tests ──

describe("WaveformAnimation", () => {
  beforeEach(() => {
    // Clean up injected keyframes between tests
    const existing = getKeyframesStyle();
    if (existing) existing.remove();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ── Rendering basics ──

  describe("rendering basics", () => {
    it("renders the default 10 bars when active", () => {
      const { container } = render(<WaveformAnimation active={true} />);
      expect(getBars(container)).toHaveLength(10);
    });

    it("renders the default 10 bars when inactive", () => {
      const { container } = render(<WaveformAnimation active={false} />);
      expect(getBars(container)).toHaveLength(10);
    });

    it("renders with a custom barCount", () => {
      const { container } = render(<WaveformAnimation active={true} barCount={5} />);
      expect(getBars(container)).toHaveLength(5);
    });


  });

  // ── Active vs inactive states ──

  describe("active vs inactive states", () => {
    it("applies paused class when inactive", () => {
      const { container } = render(<WaveformAnimation active={false} />);
      getBars(container).forEach((bar) => {
        expect(bar.classList.contains("paused")).toBe(true);
      });
    });

    it("does not apply paused class when active", () => {
      const { container } = render(<WaveformAnimation active={true} />);
      getBars(container).forEach((bar) => {
        expect(bar.classList.contains("paused")).toBe(false);
      });
    });

    it("uses activeColor when active", () => {
      const { container } = render(
        <WaveformAnimation active={true} activeColor="rgb(0, 128, 0)" />,
      );
      getBars(container).forEach((bar) => {
        expect((bar as HTMLElement).style.backgroundColor).toBe("rgb(0, 128, 0)");
      });
    });

    it("uses inactiveColor when inactive", () => {
      const { container } = render(
        <WaveformAnimation active={false} inactiveColor="rgb(128, 128, 128)" />,
      );
      getBars(container).forEach((bar) => {
        expect((bar as HTMLElement).style.backgroundColor).toBe("rgb(128, 128, 128)");
      });
    });

    it("sets high opacity (0.9) when active", () => {
      const { container } = render(<WaveformAnimation active={true} />);
      getBars(container).forEach((bar) => {
        expect((bar as HTMLElement).style.opacity).toBe("0.9");
      });
    });

    it("sets low opacity (0.4) when inactive", () => {
      const { container } = render(<WaveformAnimation active={false} />);
      getBars(container).forEach((bar) => {
        expect((bar as HTMLElement).style.opacity).toBe("0.4");
      });
    });
  });

  // ── Animation delays ──

  describe("animation delays", () => {
    it("sets staggered animation delays on each bar", () => {
      const { container } = render(<WaveformAnimation active={true} barCount={4} />);
      const bars = getBars(container);
      // For 4 bars: delays are 0.00s, 0.20s, 0.40s, 0.60s
      const expected = ["0.00s", "0.20s", "0.40s", "0.60s"];
      bars.forEach((bar, i) => {
        expect((bar as HTMLElement).style.animationDelay).toBe(expected[i]);
      });
    });

    it("sets delays that scale with barCount", () => {
      const { container } = render(<WaveformAnimation active={true} barCount={10} />);
      const bars = getBars(container);
      // For 10 bars: delays are 0.00s, 0.08s, 0.16s, ..., 0.72s
      const expected = ["0.00s", "0.08s", "0.16s", "0.24s", "0.32s", "0.40s", "0.48s", "0.56s", "0.64s", "0.72s"];
      bars.forEach((bar, i) => {
        expect((bar as HTMLElement).style.animationDelay).toBe(expected[i]);
      });
    });
  });

  // ── Styling props ──

  describe("styling props", () => {
    it("applies additional className to the container", () => {
      const { container } = render(
        <WaveformAnimation active={true} className="my-custom-class" />,
      );
      const waveformContainer = getContainer(container);
      expect(waveformContainer).not.toBeNull();
      expect(waveformContainer!.classList.contains("my-custom-class")).toBe(true);
    });

    it("uses custom sizeClass for bar container height", () => {
      const { container } = render(
        <WaveformAnimation active={true} sizeClass="h-6" />,
      );
      const waveformContainer = getContainer(container);
      expect(waveformContainer).not.toBeNull();
      expect(waveformContainer!.classList.contains("h-6")).toBe(true);
    });
  });

  // ── CSS keyframes injection ──

  describe("CSS keyframes injection", () => {
    it("injects keyframes style element into document head on mount", () => {
      expect(getKeyframesStyle()).toBeNull();
      render(<WaveformAnimation active={true} />);
      expect(getKeyframesStyle()).not.toBeNull();
      expect(getKeyframesStyle()!.textContent).toContain("waveform-bar");
    });

    it("does not duplicate the style element on multiple mounts", () => {
      render(<WaveformAnimation active={true} />);
      render(<WaveformAnimation active={true} />);
      render(<WaveformAnimation active={false} />);

      // There should be exactly one style element with our ID
      const styles = document.querySelectorAll("#waveform-animation-keyframes");
      expect(styles).toHaveLength(1);
    });
  });

  // ── SSR behavior ──

  describe("SSR behavior", () => {
    it("renders correct HTML via ReactDOMServer without crashing", () => {
      const html = renderToStaticMarkup(
        <WaveformAnimation active={true} barCount={3} />,
      );
      expect(html).toContain("aria-hidden=\"true\"");
      // 3 bars rendered
      const matches = html.match(/waveform-bar-reusable/g);
      expect(matches).toHaveLength(3);
    });

    it("does not inject keyframes into document during SSR", () => {
      // ReactDOMServer does not trigger useEffect, so keyframes
      // should never be injected into the real document
      renderToStaticMarkup(<WaveformAnimation active={true} />);
      expect(
        document.getElementById("waveform-animation-keyframes"),
      ).toBeNull();
    });

    it("returns early without DOM access when document is undefined", () => {
      // This directly tests the SSR guard in ensureKeyframesInjected.
      // Simulate a non-browser environment where document is not available.
      const getElementByIdSpy = vi.spyOn(document, "getElementById");

      vi.stubGlobal("document", undefined);

      // Call the guard function directly — it should return early
      expect(() => {
        __test__ensureKeyframesInjected();
      }).not.toThrow();

      vi.unstubAllGlobals();

      // Verify: getElementById was never called (guard returned early)
      expect(getElementByIdSpy).not.toHaveBeenCalled();

      // Verify no keyframes were injected
      expect(
        document.getElementById("waveform-animation-keyframes"),
      ).toBeNull();
    });

    it("renders via ReactDOMServer without DOM access", () => {
      vi.stubGlobal("document", undefined);

      expect(() => {
        renderToStaticMarkup(<WaveformAnimation active={true} />);
      }).not.toThrow();

      vi.unstubAllGlobals();

      // No keyframes should have been injected
      expect(
        document.getElementById("waveform-animation-keyframes"),
      ).toBeNull();
    });

    it("renders with correct inactive state during SSR", () => {
      const html = renderToStaticMarkup(
        <WaveformAnimation active={false} barCount={2} />,
      );
      // Bars should have the paused class
      const bars = html.match(/waveform-bar-reusable/g);
      expect(bars).toHaveLength(2);
      expect(html).toContain("paused");
    });
  });

  // ── Snapshots ──

  describe("snapshots", () => {
    it("matches snapshot for default active state (10 bars)", () => {
      const { container } = render(<WaveformAnimation active={true} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("matches snapshot for default inactive state (paused)", () => {
      const { container } = render(<WaveformAnimation active={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("matches snapshot with custom barCount and colors", () => {
      const { container } = render(
        <WaveformAnimation
          active={true}
          barCount={4}
          activeColor="rgb(34, 197, 94)"
          inactiveColor="rgb(229, 231, 235)"
          className="mx-auto"
          sizeClass="h-5"
          gapClass="gap-[3px]"
        />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("matches SSR snapshot via renderToStaticMarkup", () => {
      const html = renderToStaticMarkup(
        <WaveformAnimation active={true} barCount={3} />,
      );
      expect(html).toMatchSnapshot();
    });

    it("matches SSR snapshot for inactive state", () => {
      const html = renderToStaticMarkup(
        <WaveformAnimation active={false} barCount={3} />,
      );
      expect(html).toMatchSnapshot();
    });
  });

  // ── Edge cases ──

  describe("edge cases", () => {
    it("renders no bars when barCount is 0", () => {
      const { container } = render(<WaveformAnimation active={true} barCount={0} />);
      expect(getBars(container)).toHaveLength(0);
    });

    it("renders a single bar when barCount is 1", () => {
      const { container } = render(<WaveformAnimation active={true} barCount={1} />);
      expect(getBars(container)).toHaveLength(1);
    });

    it("renders many bars without error", () => {
      const { container } = render(<WaveformAnimation active={true} barCount={50} />);
      expect(getBars(container)).toHaveLength(50);
    });

    it("handles rapid re-renders between active/inactive", () => {
      const { container, rerender } = render(<WaveformAnimation active={true} />);

      // Switch to inactive
      rerender(<WaveformAnimation active={false} />);
      expect(getBars(container)).toHaveLength(10);
      getBars(container).forEach((bar) => {
        expect((bar as HTMLElement).style.opacity).toBe("0.4");
      });

      // Switch back to active
      rerender(<WaveformAnimation active={true} />);
      expect(getBars(container)).toHaveLength(10);
      getBars(container).forEach((bar) => {
        expect((bar as HTMLElement).style.opacity).toBe("0.9");
      });
    });
  });

  // ── Accessibility ──

  describe("accessibility", () => {
    it("has aria-hidden on the container", () => {
      render(<WaveformAnimation active={true} />);
      const hiddenEl = document.querySelector("[aria-hidden='true']");
      expect(hiddenEl).toBeInTheDocument();
    });

    it("does not contain interactive elements", () => {
      const { container } = render(<WaveformAnimation active={true} />);
      const interactive = container.querySelectorAll("button, a, input, select, textarea, [role='button']");
      expect(interactive).toHaveLength(0);
    });
  });
});
