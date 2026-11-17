import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { TakeawayEditor } from './TakeawayEditor';
import { parseTakeaways } from '../helpers/editorContent';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (s: string) => s }));

it('adds, edits and removes individual takeaways without splitting multiline items', () => {
  function Harness() {
    const [items, setItems] = useState(parseTakeaways('["First takeaway\\nwith a second paragraph","Second takeaway"]'));
    return <TakeawayEditor value={items} onChange={setItems} />;
  }
  render(<Harness />);
  expect(screen.getByLabelText('Takeaway 1')).toHaveValue('First takeaway\nwith a second paragraph');
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
  fireEvent.click(screen.getByRole('button', { name: 'Add takeaway' }));
  fireEvent.change(screen.getByLabelText('Takeaway 3'), { target: { value: 'Third\nmultiline takeaway' } });
  expect(screen.getByLabelText('Takeaway 3')).toHaveValue('Third\nmultiline takeaway');
  fireEvent.click(screen.getByRole('button', { name: 'Remove takeaway 2' }));
  expect(screen.getAllByRole('textbox')).toHaveLength(2);
  expect(screen.getByLabelText('Takeaway 2')).toHaveValue('Third\nmultiline takeaway');
});
