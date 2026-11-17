import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BookPrologueDetail from './BookPrologueDetail';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), item: {
  loading: false, bookName: 'Genesis', title: 'Beginnings and Covenant', author: 'Moses', chapters: 50, audience: 'Israel',
  authorDetail: 'About the author text', summary: 'Summary text', purpose: 'Purpose text', keyTheme: 'Covenant',
  background: 'Background text', lessons: 'Lessons text', christConnection: 'Christ connection text',
  applications: ['Apply this lesson'], keyScripture: [{ reference: 'Genesis 1:1', text: 'In the beginning.' }],
  mainThemes: ['Creation'], keyPeople: ['Abraham'], keyVerses: ['Genesis 12:1'],
  structure: [{ range: '1–11', title: 'Primeval history' }], dateWritten: 'Ancient Israel', locationWritten: 'Wilderness',
} }));
vi.mock('../hooks/useBookPrologueDetail', () => ({ useBookPrologueDetail: () => ({ data: mocks.item, actions: { navigate: mocks.navigate } }) }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

beforeEach(() => vi.clearAllMocks());

describe('editorial prologue detail page', () => {
  it('preserves every content section without a duplicate title card', () => {
    render(<BookPrologueDetail />);
    expect(screen.getAllByText('Beginnings and Covenant')).toHaveLength(1);
    for (const name of ['Summary', 'Purpose', 'About the Author', 'Historical Background', 'Key Theme', 'Key Lessons', 'Christ Connection', 'Key Applications for Today', 'Key Scripture', 'Main Themes', 'Key People', 'Key Verses', 'Book Structure']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    for (const text of ['Apply this lesson', 'In the beginning.', 'Abraham', 'Genesis 12:1', 'Primeval history', 'Wilderness']) expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Book study notes' })).toBeInTheDocument();
  });

  it('keeps edit and back navigation working', () => {
    render(<BookPrologueDetail />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit prologue' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/edit-book-prologue/Genesis');
    fireEvent.click(screen.getAllByRole('button', { name: 'Back to Prologues' })[0]);
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/book-prologues');
  });
});
