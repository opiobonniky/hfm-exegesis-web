import { SUPPORTED_LANGUAGES, type Language } from './type';

export const GOOGLE_TRANSLATE_ELEMENT_ID = 'google_translate_element';

const SCRIPT_ID = 'google-translate-element-script';
const CALLBACK_NAME = 'googleTranslateElementInit';
const GOOGLE_LANGUAGE_CODES: Partial<Record<Language, string>> = {
  fil: 'tl',
  kok: 'gom',
  // Google spells Meitei with its script tag
  mni: 'mni-Mtei',
  zh: 'zh-CN',
};

type GoogleTranslateConstructor = new (
  options: {
    pageLanguage: string;
    includedLanguages: string;
    autoDisplay: boolean;
    multilanguagePage: boolean;
  },
  elementId: string,
) => unknown;

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateConstructor;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

let readyPromise: Promise<void> | null = null;

function googleLanguageCode(lang: Language): string {
  return GOOGLE_LANGUAGE_CODES[lang] ?? lang;
}

function cookieDomain(): string | null {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || /^\d+(?:\.\d+){3}$/.test(hostname)) return null;
  const parts = hostname.split('.');
  return parts.length > 1 ? `.${parts.slice(-2).join('.')}` : null;
}

function writeTranslationCookie(value: string, expires = ''): void {
  const suffix = `;path=/;SameSite=Lax${expires}`;
  document.cookie = `googtrans=${value}${suffix}`;
  const domain = cookieDomain();
  if (domain) document.cookie = `googtrans=${value}${suffix};domain=${domain}`;
}

function primeGoogleCookie(lang: Language): void {
  if (lang === 'en') {
    const expired = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
    writeTranslationCookie('', expired);
    return;
  }
  writeTranslationCookie(`/en/${googleLanguageCode(lang)}`);
}

function waitForSelector(resolve: () => void, reject: (error: Error) => void): () => void {
  let attempt = 0;
  const timer = window.setInterval(() => {
    attempt += 1;
    if (document.querySelector<HTMLSelectElement>('.goog-te-combo')) {
      window.clearInterval(timer);
      resolve();
    } else if (attempt >= 100) {
      window.clearInterval(timer);
      reject(new Error('Google Translate selector did not initialize'));
    }
  }, 100);
  return () => window.clearInterval(timer);
}

export function loadGoogleTranslate(initialLanguage: Language): Promise<void> {
  primeGoogleCookie(initialLanguage);
  if (readyPromise) return readyPromise;

  readyPromise = new Promise<void>((resolve, reject) => {
    let settled = false;
    let stopWaiting: (() => void) | undefined;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(deadline);
      stopWaiting?.();
      if (error) reject(error);
      else resolve();
    };
    // Includes script download and callback initialization, not just selector
    // polling. Ad blockers/offline connections must not leave loading stuck.
    const deadline = window.setTimeout(() => finish(new Error('Google Translate timed out')), 15_000);
    const initialize = () => {
      if (settled) return;
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement) {
        finish(new Error('Google Translate Element is unavailable'));
        return;
      }

      const container = document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID);
      if (!container) {
        finish(new Error('Google Translate container is missing'));
        return;
      }

      try {
        if (!container.hasChildNodes()) new TranslateElement({
          pageLanguage: 'en',
          includedLanguages: SUPPORTED_LANGUAGES
            .filter((lang) => lang !== 'en')
            .map(googleLanguageCode)
            .join(','),
          autoDisplay: false,
          multilanguagePage: true,
        }, GOOGLE_TRANSLATE_ELEMENT_ID);
        stopWaiting = waitForSelector(() => finish(), finish);
      } catch {
        finish(new Error('Google Translate initialization failed'));
      }
    };

    window.googleTranslateElementInit = initialize;
    if (window.google?.translate?.TranslateElement) {
      initialize();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('error', () => finish(new Error('Google Translate script failed to load')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://translate.google.com/translate_a/element.js?cb=${CALLBACK_NAME}`;
    script.async = true;
    script.onerror = () => finish(new Error('Google Translate script failed to load'));
    document.head.appendChild(script);
  }).catch((error) => {
    // A failed script must not poison every later navigation/language switch.
    readyPromise = null;
    document.getElementById(SCRIPT_ID)?.remove();
    document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID)?.replaceChildren();
    throw error;
  });

  return readyPromise;
}

/** Drive Google's own language selector. Returns false until the widget is ready. */
export function applyGoogleLanguage(lang: Language): boolean {
  primeGoogleCookie(lang);
  const selector = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (!selector) return false;

  const target = lang === 'en' ? '' : googleLanguageCode(lang);
  if (selector.value !== target) {
    selector.value = target;
    selector.dispatchEvent(new Event('change', { bubbles: true }));
  }
  return true;
}
