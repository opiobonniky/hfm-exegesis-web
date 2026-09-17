import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GeneratingOverlay } from "./GeneratingOverlay";

// ── Helpers ──

function getPulseBar(container: HTMLElement): HTMLElement | null {
  return container.querySelector(".bg-gradient-to-r");
}

function getBadge(container: HTMLElement): HTMLElement | null {
  return container.querySelector(".backdrop-blur-sm");
}

function getDots(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(".rounded-full[style*='animation']");
}

// ── Tests ──

describe("GeneratingOverlay", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Idle state ──

  describe("idle state", () => {
    it("renders nothing when loading is false", () => {
      const { container } = render(<GeneratingOverlay loading={false} />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByText("Generating")).not.toBeInTheDocument();
    });

    it("renders nothing when loading is false even with a tone and label", () => {
      const { container } = render(
        <GeneratingOverlay loading={false} tone="blue" label="Loading audio" />,
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Rendering basics ──

  describe("rendering basics", () => {
    it("renders the pulse bar when loading", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      expect(getPulseBar(container)).not.toBeNull();
      expect(getPulseBar(container)!.classList.contains("animate-pulse")).toBe(true);
    });

    it("renders the status badge when loading", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      expect(getBadge(container)).not.toBeNull();
    });

    it("renders the default label 'Generating'", () => {
      render(<GeneratingOverlay loading={true} />);
      expect(screen.getByText("Generating")).toBeInTheDocument();
    });
  });

  // ── Typing dots ──

  describe("typing dots", () => {
    it("renders three dots", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      expect(getDots(container)).toHaveLength(3);
    });

    it("staggers dot animation delays at 0ms, 200ms, and 400ms", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      const dots = getDots(container);
      const delays = Array.from(dots).map(
        (dot) => (dot as HTMLElement).style.animationDelay,
      );
      expect(delays).toEqual(["0ms", "200ms", "400ms"]);
    });

    it("applies the pulse animation to each dot", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      getDots(container).forEach((dot) => {
        expect((dot as HTMLElement).style.animation).toContain("pulse");
      });
    });

    it("marks the dots container as aria-hidden (label conveys status)", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      const hiddenDots = container.querySelector("[aria-hidden='true']");
      expect(hiddenDots).not.toBeNull();
      expect(hiddenDots!.querySelectorAll(".rounded-full[style*='animation']")).toHaveLength(3);
    });
  });

  // ── Tones ──

  describe("tones", () => {
    it("uses the amber tone by default", () => {
      const { container } = render(<GeneratingOverlay loading={true} />);
      expect(getBadge(container)!.classList.contains("bg-amber-500/15")).toBe(true);
      expect(getBadge(container)!.classList.contains("border-amber-400/20")).toBe(true);
      expect(getPulseBar(container)!.classList.contains("from-amber-300/40")).toBe(true);
      expect(screen.getByText("Generating").classList.contains("text-amber-700")).toBe(true);
    });

    it("applies the rose tone when tone='rose'", () => {
      const { container } = render(<GeneratingOverlay loading={true} tone="rose" />);
      expect(getBadge(container)!.classList.contains("bg-rose-500/15")).toBe(true);
      expect(getBadge(container)!.classList.contains("border-rose-400/20")).toBe(true);
      expect(getPulseBar(container)!.classList.contains("from-rose-300/40")).toBe(true);
      expect(screen.getByText("Generating").classList.contains("text-rose-700")).toBe(true);
    });

    it("applies the blue tone when tone='blue'", () => {
      const { container } = render(<GeneratingOverlay loading={true} tone="blue" />);
      expect(getBadge(container)!.classList.contains("bg-blue-500/15")).toBe(true);
      expect(getBadge(container)!.classList.contains("border-blue-400/20")).toBe(true);
      expect(getPulseBar(container)!.classList.contains("from-blue-300/40")).toBe(true);
      expect(screen.getByText("Generating").classList.contains("text-blue-700")).toBe(true);
    });

    it("colors the dots with the tone color", () => {
      const { container } = render(<GeneratingOverlay loading={true} tone="blue" />);
      getDots(container).forEach((dot) => {
        expect(dot.classList.contains("bg-blue-500")).toBe(true);
      });
    });
  });

  // ── Labels ──

  describe("labels", () => {
    it("renders a custom label", () => {
      render(<GeneratingOverlay loading={true} label="Loading audio" />);
      expect(screen.getByText("Loading audio")).toBeInTheDocument();
    });

    it("does not render the default label when a custom one is provided", () => {
      render(<GeneratingOverlay loading={true} label="Loading audio" />);
      expect(screen.queryByText("Generating")).not.toBeInTheDocument();
    });

    it("uppercases and letter-spaces the label styling", () => {
      const { container } = render(<GeneratingOverlay loading={true} label="Loading audio" />);
      const labelEl = screen.getByText("Loading audio");
      expect(labelEl.classList.contains("uppercase")).toBe(true);
      expect(labelEl.classList.contains("tracking-wider")).toBe(true);
      expect(labelEl.classList.contains("font-bold")).toBe(true);
      expect(getBadge(container)).not.toBeNull();
    });
  });

  // ── Re-rendering ──

  describe("re-rendering", () => {
    it("appears when loading flips from false to true", () => {
      const { container, rerender } = render(<GeneratingOverlay loading={false} />);
      expect(container.firstChild).toBeNull();

      rerender(<GeneratingOverlay loading={true} />);
      expect(getBadge(container)).not.toBeNull();
      expect(screen.getByText("Generating")).toBeInTheDocument();
    });

    it("disappears when loading flips from true to false", () => {
      const { container, rerender } = render(<GeneratingOverlay loading={true} />);
      expect(getBadge(container)).not.toBeNull();

      rerender(<GeneratingOverlay loading={false} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
