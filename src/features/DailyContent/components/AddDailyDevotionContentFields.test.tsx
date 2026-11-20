import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AddDailyDevotionContentFields } from './AddDailyDevotionContentFields';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
afterEach(cleanup);

function Editor({ lessons = [] }: { lessons?: string[] }) {
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  const [practicalApplications, setPracticalApplications] = useState<string[]>([]);
  const [learningPoints, setLearningPoints] = useState(lessons);
  return <AddDailyDevotionContentFields explanation="Body" prayer="Amen"
    reflectionQuestions={reflectionQuestions} setReflectionQuestions={setReflectionQuestions}
    practicalApplications={practicalApplications} setPracticalApplications={setPracticalApplications}
    learningPoints={learningPoints} setLearningPoints={setLearningPoints}
    setExplanation={vi.fn()} setPrayer={vi.fn()}
    errors={{ learningPoints: learningPoints.length !== 3 || learningPoints.some(item => !item.trim())
      ? 'Exactly three non-empty learning points are required.' : undefined }} />;
}

it('adds, edits and removes individually sized question and application rows', () => {
  render(<Editor />);
  fireEvent.click(screen.getByRole('button', { name: 'Add question' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add application' }));
  const question = screen.getByRole('textbox', { name: 'Reflection question 1' });
  const application = screen.getByRole('textbox', { name: 'Application 1' });
  expect(question.getAttribute('rows')).toBe('2');
  expect(application.getAttribute('rows')).toBe('3');
  fireEvent.change(question, { target: { value: 'How can I serve?\nConsider your neighbours.' } });
  expect(screen.getAllByRole('textbox', { name: /Reflection question/ })).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Remove question 1' }));
  expect(screen.queryByRole('textbox', { name: 'Reflection question 1' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Remove application 1' }));
  expect(screen.getByText('No practical applications added yet.')).toBeTruthy();
});

it('limits new lessons to three, displays inline errors and allows removal', () => {
  render(<Editor />);
  for (let i = 1; i <= 3; i++) {
    fireEvent.click(screen.getByRole('button', { name: 'Add learning point' }));
    fireEvent.change(screen.getByRole('textbox', { name: `Learning point ${i}` }), { target: { value: `Lesson ${i}` } });
  }
  expect(screen.queryByText('Exactly three non-empty learning points are required.')).toBeNull();
  expect((screen.getByRole('button', { name: 'Add learning point' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Remove learning point 2' }));
  expect(screen.getByText('Exactly three non-empty learning points are required.')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Add learning point' }) as HTMLButtonElement).disabled).toBe(false);
});

it('retains all five legacy lessons for explicit review instead of truncating data', () => {
  render(<Editor lessons={['One', 'Two', 'Three', 'Four', 'Five']} />);
  expect(screen.getAllByRole('textbox', { name: /Learning point/ })).toHaveLength(5);
  expect(screen.getByRole('textbox', { name: 'Learning point 5' }).getAttribute('aria-invalid')).toBe('true');
});
