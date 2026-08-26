// Shared parse/format helpers for content detail pages

/** Parse a value into a list of strings (handles JSON arrays, newline-separated, plain strings) */
export const parseList = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      return val.map((item: any) => {
        if (item.word && item.definition) return `${item.word} — ${item.definition}`;
        return JSON.stringify(item);
      });
    }
    return val.map(String);
  }
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) {
      if (p.length > 0 && typeof p[0] === "object" && p[0] !== null) {
        return p.map((item: any) => {
          if (item.word && item.definition) return `${item.word} — ${item.definition}`;
          return JSON.stringify(item);
        });
      }
      return p.map(String);
    }
  } catch { /* not JSON */ }
  return str.split("\n").map(s => s.trim()).filter(Boolean);
};

/** Parse word studies from JSON array or newline-separated format */
export const parseWordStudies = (val: any): Array<{ word: string; strongs?: string; definition?: string }> => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item: any) => ({
      word: item.word || "",
      strongs: item.strongs || item.Strongs || "",
      definition: item.definition || "",
    }));
  }
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) {
      return p.map((item: any) => ({
        word: item.word || "",
        strongs: item.strongs || item.Strongs || "",
        definition: item.definition || "",
      }));
    }
  } catch { /* not JSON */ }
  return str.split("\n").map(s => s.trim()).filter(Boolean).map(line => {
    const parts = line.split("|").map(p => p.trim());
    return { word: parts[0] || "", strongs: parts[1] || "", definition: parts[2] || "" };
  });
};

/** Parse tags from comma-separated string or JSON array */
export const parseTags = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) return p.map(String).map(s => s.trim()).filter(Boolean);
  } catch { /* not JSON */ }
  return str.split(",").map(s => s.trim()).filter(Boolean);
};

/** Format a date string to readable format */
export const fmtDate = (d: string | null, style: "long" | "short" = "long") => {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (style === "long") {
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
};

/** Parse a structured field (JSON array) into newline-separated text for textarea */
export const parseStructuredField = (val: any): string => {
  if (!val) return "";
  if (Array.isArray(val)) {
    return val.map((item: any) => {
      if (typeof item === "object" && item !== null) {
        if (item.word && item.strongs && item.definition) {
          return `${item.word} | ${item.strongs} | ${item.definition}`;
        }
        return JSON.stringify(item);
      }
      return String(item);
    }).join("\n");
  }
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) {
      return p.map((item: any) => {
        if (typeof item === "object" && item !== null) {
          if (item.word && item.strongs && item.definition) {
            return `${item.word} | ${item.strongs} | ${item.definition}`;
          }
          return JSON.stringify(item);
        }
        return String(item);
      }).join("\n");
    }
  } catch { /* not JSON */ }
  return str;
};
