import { translateUiCopy } from './uiCopy';

/** Authored UI copy only; missing entries remain honest source-language text. */
export function tt(text: string): string {
  try { return translateUiCopy(text, localStorage.getItem('exegesis-language') || 'en'); }
  catch { return text; }
}
