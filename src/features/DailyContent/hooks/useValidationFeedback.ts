import { useState, type FocusEvent } from 'react';

/** Validation always runs; this only controls when the results become visible. */
export function useValidationFeedback() {
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [attempted, setAttempted] = useState<Set<string>>(() => new Set());
  const touch = (key: string) => setTouched(previous => previous.has(key) ? previous : new Set([...previous, key]));
  const attempt = (scope: string) => setAttempted(previous => previous.has(scope) ? previous : new Set([...previous, scope]));
  const visible = (key: string, scope: string) => attempted.has(scope) || touched.has(`${scope}:${key}`);
  const bind = (key: string, scope: string) => ({
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) touch(`${scope}:${key}`);
    },
  });
  const capture = (scope: string) => ({
    onBlurCapture: (event: FocusEvent<HTMLElement>) => {
      const field = event.target.closest<HTMLElement>('[data-validation-field]');
      const key = field?.dataset.validationField;
      if (key && !field.contains(event.relatedTarget)) touch(`${scope}:${key}`);
    },
  });
  return { attempt, visible, bind, capture, attempted: (scope: string) => attempted.has(scope) };
}
