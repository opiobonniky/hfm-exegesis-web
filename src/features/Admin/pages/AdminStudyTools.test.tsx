import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminStudyTools from './AdminStudyTools';

vi.mock('../hooks/useStudyTools', () => ({ useStudyTools: () => ({ data: {}, actions: { navigate: vi.fn() } }) }));
vi.mock('../components/WordsTab', () => ({ default: () => <button>Add study word</button> }));
vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));

describe('Strong’s words admin page', () => {
  it('shows only word management, without the old resource/study/prologue tabs', () => {
    render(<AdminStudyTools />);
    expect(screen.getByRole('heading', { name: 'Strong’s Word Studies' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add study word' })).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    expect(screen.queryByText('Studies')).not.toBeInTheDocument();
    expect(screen.queryByText('Prologues')).not.toBeInTheDocument();
    expect(screen.queryByText('Add resource')).not.toBeInTheDocument();
  });
});
