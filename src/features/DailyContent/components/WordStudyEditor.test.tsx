import { useState } from 'react';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WordStudyEditor } from './WordStudyEditor';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('@/services/strongsApi', () => ({ getStrongsEntry: vi.fn() }));
afterEach(cleanup);

describe('word study field errors', () => {
  it('marks only the missing definition, then clears its error when corrected', () => {
    function Editor() {
      const [rows, setRows] = useState([{ surfaceText: 'Word', strongsId: 'G11', customDefinition: '' }]);
      return <WordStudyEditor value={rows} onChange={setRows} />;
    }
    render(<Editor />);
    const id = screen.getByLabelText("Strong's ID");
    const definition = screen.getByLabelText('Definition and contextual meaning');
    expect(id.getAttribute('aria-invalid')).toBe('false');
    expect(id.className).not.toContain('border-destructive');
    expect(definition.getAttribute('aria-invalid')).toBe('true');
    expect(definition.className).toContain('border-destructive');
    expect(document.getElementById(definition.getAttribute('aria-describedby')!)?.textContent).toContain('Enter the definition');
    fireEvent.change(definition, { target: { value: 'Meaning in this passage' } });
    expect(definition.getAttribute('aria-invalid')).toBe('false');
    expect(screen.queryByText('Enter the definition or contextual meaning.')).toBeNull();
  });
  it('does not mark a completely empty optional row invalid', () => {
    render(<WordStudyEditor value={[{ surfaceText: '', strongsId: '', customDefinition: '' }]} onChange={() => {}} />);
    expect(screen.getAllByRole('textbox').every(field => field.getAttribute('aria-invalid') === 'false')).toBe(true);
  });
  it('does not re-flag saved fields when editing has not touched rich content', () => {
    render(<WordStudyEditor showErrors={false} value={[{ surfaceText: 'Word', strongsId: 'not-an-id', customDefinition: '' }]} onChange={() => {}} />);
    expect(screen.getAllByRole('textbox').every(field => field.getAttribute('aria-invalid') === 'false')).toBe(true);
    expect(screen.queryByText(/Enter the definition/)).toBeNull();
  });
});
