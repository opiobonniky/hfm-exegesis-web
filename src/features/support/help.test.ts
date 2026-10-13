import { describe, expect, it } from "vitest";
import {
  filterSupportHelp,
  groupSupportHelp,
  helpItemToSubject,
  normalizeHelpQuery,
  pickFeaturedHelp,
} from "./utils";
import type { SupportHelpItem, SupportHelpTopic } from "./types";

const topics: SupportHelpTopic[] = [
  { id: "account", label: "Account", description: "" },
  { id: "bible", label: "Bible", description: "" },
];

const items: SupportHelpItem[] = [
  {
    id: "edit-profile",
    topic: "account",
    question: "How do I edit my profile?",
    answer: "Open Edit Profile and change your details.",
    keywords: ["name", "email"],
    category: "account",
    featured: true,
  },
  {
    id: "forgot-password",
    topic: "account",
    question: "I forgot my password. How do I reset it?",
    answer: "Choose Forgot password on the sign-in screen.",
    steps: ["Request a code", "Enter the code"],
    category: "account",
  },
  {
    id: "download",
    topic: "bible",
    question: "How do I download a Bible?",
    answer: "Open the Bible Library.",
    keywords: ["offline"],
    category: "bible",
    featured: true,
  },
];

describe("normalizeHelpQuery", () => {
  it("lower-cases, trims, strips accents and collapses spaces", () => {
    expect(normalizeHelpQuery("  Édit   Profile ")).toBe("edit profile");
    expect(normalizeHelpQuery("Strong’s")).toBe("strong's");
  });
});

describe("filterSupportHelp", () => {
  it("returns everything for an empty query", () => {
    expect(filterSupportHelp(items, "")).toHaveLength(3);
  });

  it("matches every word across question, answer, steps and keywords", () => {
    expect(filterSupportHelp(items, "reset password").map(i => i.id)).toEqual(["forgot-password"]);
    expect(filterSupportHelp(items, "offline").map(i => i.id)).toEqual(["download"]);
    expect(filterSupportHelp(items, "email profile").map(i => i.id)).toEqual(["edit-profile"]);
  });

  it("respects the topic filter", () => {
    expect(filterSupportHelp(items, "", "bible").map(i => i.id)).toEqual(["download"]);
    expect(filterSupportHelp(items, "profile", "bible")).toEqual([]);
  });
});

describe("groupSupportHelp", () => {
  it("groups by topic in topic order and drops empty topics", () => {
    const groups = groupSupportHelp(items, topics);
    expect(groups.map(g => g.topic.id)).toEqual(["account", "bible"]);
    expect(groups[0].items.map(i => i.id)).toEqual(["edit-profile", "forgot-password"]);
  });
});

describe("pickFeaturedHelp", () => {
  it("prefers featured items and caps at the limit", () => {
    expect(pickFeaturedHelp(items, 2).map(i => i.id)).toEqual(["edit-profile", "download"]);
    expect(pickFeaturedHelp(items, 0)).toEqual([]);
  });
});

describe("helpItemToSubject", () => {
  it("builds a subject without the trailing question mark and respects the limit", () => {
    expect(helpItemToSubject(items[0], 140)).toBe("Help with: How do I edit my profile");
  });
});