import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LabLookStage from './LabLookStage';

describe('LabLookStage', () => {
  it('renders the exact verse text and protects it from DOM translation', () => {
    const text = 'El Señor está aquí; café. Καὶ ὁ λόγος ἦν πρὸς τὸν θεόν.';
    render(
      <LabLookStage
        passageRef="John 1:1"
        bookName="John"
        chapter="1"
        passageVerses={[{ verseNumber: 1, text }]}
        versesLoading={false}
        lookNotes=""
        setLookNotes={() => {}}
        saving={false}
        onAdvance={() => {}}
      />,
    );

    const verse = screen.getByText(text);
    expect(verse.textContent).toBe(text);
    expect(verse).toHaveAttribute('translate', 'no');
    expect(verse).toHaveClass('notranslate');
  });
});
