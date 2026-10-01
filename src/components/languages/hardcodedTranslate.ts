/**
 * English source marker for literal UI strings.
 * Google Translate Element translates the rendered DOM, so this intentionally
 * returns source text without consulting generated locale dictionaries.
 */
export function tt(text: string): string {
  return text;
}
