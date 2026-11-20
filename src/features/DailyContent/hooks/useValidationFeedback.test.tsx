import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';
import { RequiredContentFields } from '../components/RequiredContentFields';
import { useValidationFeedback } from './useValidationFeedback';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

it('shows the blurred field only, clears corrected errors, then reveals unvisited fields on Continue', () => {
  function ContentStep() {
    const feedback = useValidationFeedback();
    const [explanation, setExplanation] = useState('');
    const scope = 'content';
    return <div {...feedback.capture(scope)}>
      <RequiredContentFields explanation={explanation} application="" verseIntroduction=""
        setExplanation={setExplanation} setApplication={vi.fn()} setVerseIntroduction={vi.fn()}
        isRtl={false}
        errors={{
          explanation: !explanation && feedback.visible('explanation', scope) ? 'Enter an explanation.' : undefined,
          application: feedback.visible('application', scope) ? 'Enter an application.' : undefined,
        }} />
      <button onClick={() => feedback.attempt(scope)}>Continue</button>
    </div>;
  }
  render(<ContentStep />);
  const explanation = screen.getByRole('textbox', { name: 'Explanation *' });
  expect(explanation.getAttribute('aria-invalid')).toBe('false');
  fireEvent.focus(explanation);
  expect(screen.queryByText('Enter an explanation.')).toBeNull();
  fireEvent.blur(explanation);
  expect(explanation.getAttribute('aria-invalid')).toBe('true');
  expect(screen.getByText('Enter an explanation.')).toBeTruthy();
  expect(screen.queryByText('Enter an application.')).toBeNull();
  fireEvent.change(explanation, { target: { value: 'Now filled' } });
  expect(screen.queryByText('Enter an explanation.')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(screen.getByText('Enter an application.')).toBeTruthy();
});
