import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// The shared test utils mock the language provider (lang: "en").
import '@/test/test-utils';
import LabLearnStage from './LabLearnStage';

const baseProps = {
  passageRef: 'John 3:16',
  bookName: 'John',
  chapter: '3',
  verseStart: '16',
  learnNotes: '',
  setLearnNotes: () => {},
  learnDataLoading: false,
  verseResources: null,
  bookPrologue: null,
  verseWords: [],
  translations: null,
  translationsLoading: false,
  isPublic: false,
  setIsPublic: () => {},
  saving: false,
  onAdvance: () => {},
  onWordTap: () => {},
};

describe('LabLearnStage sections', () => {
  it('lists the seven sections vertically', () => {
    render(<LabLearnStage {...baseProps} />);

    const labels = [
      'Book Prologue',
      'Original Language',
      'Historical Context',
      'Geography',
      'Theology',
      'Cross References',
      'Study Notes',
    ];
    labels.forEach((label) => {
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument();
    });
  });

  it('shows only the open section’s content', () => {
    render(<LabLearnStage {...baseProps} />);

    // Study Notes is open by default.
    expect(
      screen.getByPlaceholderText(/write your study notes/i),
    ).toBeInTheDocument();

    // The other sections are closed: their headings are still listed, but
    // their content is not shown.
    expect(
      screen.queryByText(/Original Language — Strong/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Historical context data not available/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No cross references available/i),
    ).not.toBeInTheDocument();
  });

  it('opens a section when its header is clicked', () => {
    render(<LabLearnStage {...baseProps} />);

    const header = screen.getByRole('button', { name: /Historical Context/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByText(/Historical context data not available/i),
    ).toBeInTheDocument();
  });
});
