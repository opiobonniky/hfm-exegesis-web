import { describe, expect, it } from "vitest";
import {
  buildStudyPdfHtml,
  esc,
  formatLookEntries,
  formatTags,
  nl2br,
  sectionBody,
  sectionHeading,
} from "./studyPdf";

const LOOK_PROMPTS = [
  "What specific words or phrases stand out to you in this passage?",
  "Who is speaking? Who is listening or being addressed?",
  "What commands, promises, warnings, or truths do you see?",
];

describe("studyPdf — escaping helpers", () => {
  it("esc() escapes HTML-sensitive characters", () => {
    expect(esc(`<script>"&'`)).toBe("&lt;script&gt;&quot;&amp;'");
  });

  it("nl2br() escapes and converts newlines to <br/>", () => {
    expect(nl2br("a < b\nc > d")).toBe("a &lt; b<br/>c &gt; d");
  });
});

describe("studyPdf — section builders", () => {
  it("sectionHeading() escapes the heading text", () => {
    expect(sectionHeading("Look < Observations")).toBe("<h2>Look &lt; Observations</h2>");
  });

  it("sectionBody() defaults to the content wrapper", () => {
    expect(sectionBody("x")).toBe('<div class="section content">x</div>');
  });

  it("sectionBody() supports a custom className and bare section", () => {
    expect(sectionBody("x", "content strongs")).toBe(
      '<div class="section content strongs">x</div>',
    );
    expect(sectionBody("x", "")).toBe('<div class="section">x</div>');
  });
});

describe("studyPdf — look entries", () => {
  it("maps prompt indexes to the actual question text", () => {
    const html = formatLookEntries(JSON.stringify({ 0: "Answer one.", 2: "Answer three." }), LOOK_PROMPTS);
    expect(html).toContain(LOOK_PROMPTS[0]);
    expect(html).toContain(LOOK_PROMPTS[2]);
    expect(html).toContain("Answer one.");
    expect(html).toContain("Answer three.");
    expect(html).not.toMatch(/Prompt \d/);
  });

  it("escapes both the question and the answer", () => {
    const html = formatLookEntries(JSON.stringify({ 0: `<img src=x onerror=alert(1)>` }), LOOK_PROMPTS);
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).not.toContain("<img");
  });

  it("falls back to a plain-text entry for non-JSON notes", () => {
    const html = formatLookEntries("plain notes\nline two", LOOK_PROMPTS);
    expect(html).toContain("plain notes");
    expect(html).toContain("<br/>");
  });

  it("falls back gracefully for out-of-range prompt indexes", () => {
    const html = formatLookEntries(JSON.stringify({ 9: "Late answer." }), LOOK_PROMPTS);
    expect(html).toContain("Question 10");
  });

  it("returns an empty section (not raw JSON) when all answers are blank", () => {
    const html = formatLookEntries(JSON.stringify({ 0: "   ", 1: "" }), LOOK_PROMPTS);
    expect(html).toBe("");
  });
});

describe("studyPdf — tags", () => {
  it("renders pill spans for each tag", () => {
    expect(formatTags(["grace", "hope"])).toBe(
      '<span class="tag">grace</span> <span class="tag">hope</span>',
    );
  });
});

describe("studyPdf — document builder", () => {
  it("builds a complete document with escaped title and sections", () => {
    const html = buildStudyPdfHtml({
      title: "Ruth 2:1",
      sections: '<h2>🔍 Look</h2><div class="entry"><p class="prompt">q</p></div>',
      dateStr: "Jan 1, 2026",
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<title>Bible Study: Ruth 2:1</title>");
    expect(html).toContain("<h1>📖 Bible Study: Ruth 2:1</h1>");
    expect(html).toContain("Created with Exegesis Bible App · Jan 1, 2026");
    expect(html).toContain("window.print();");
    expect(html).toContain("window.onafterprint");
    expect(html).toContain("<h2>🔍 Look</h2>");
    expect(html).toContain(".entry");
  });

  it("escapes the title to prevent XSS in the print window", () => {
    const html = buildStudyPdfHtml({ title: `"><script>alert(1)</script>`, sections: "", dateStr: "d" });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });
});
