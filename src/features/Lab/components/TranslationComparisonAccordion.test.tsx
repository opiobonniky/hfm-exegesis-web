import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
// The shared test utils mock the language provider (lang: "en").
import '@/test/test-utils';
import TranslationComparisonAccordion from './TranslationComparisonAccordion';

const ENGLISH_VERSIONS = [
  {
    version: 'King James Version',
    abbreviation: 'KJV',
    text: 'In the beginning',
    id: 'KJV',
    language: 'en',
    languageName: 'English',
  },
  {
    version: 'Berean Bible',
    abbreviation: 'BSB',
    text: 'In the beginning',
    id: 'BSB',
    language: 'en',
    languageName: 'English',
  },
  {
    version: 'American Standard Version',
    abbreviation: 'ASV',
    text: 'In the beginning',
    id: 'ASV',
    language: 'en',
    languageName: 'English',
  },
];

const SWAHILI_VERSION = {
  version: 'Swahili Union Version',
  abbreviation: 'SUV',
  text: 'Hapo mwanzo',
  id: 'Swahili',
  language: 'sw',
  languageName: 'Swahili',
};

describe('TranslationComparisonAccordion', () => {
  it('puts every version of the reader’s language behind one accordion', () => {
    render(<TranslationComparisonAccordion translations={ENGLISH_VERSIONS} />);

    const header = screen.getByRole('button', { name: /Translation Versions/i });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('3 versions')).toBeInTheDocument();

    // Every version is visible, so they can be compared side by side.
    expect(screen.getByText('King James Version')).toBeInTheDocument();
    expect(screen.getByText('Berean Bible')).toBeInTheDocument();
    expect(screen.getByText('American Standard Version')).toBeInTheDocument();
  });

  it('collapses the group when its header is clicked', () => {
    render(<TranslationComparisonAccordion translations={ENGLISH_VERSIONS} />);

    const header = screen.getByRole('button', { name: /Translation Versions/i });
    fireEvent.click(header);

    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Berean Bible')).not.toBeInTheDocument();
  });

  it('ignores versions from another language', () => {
    render(
      <TranslationComparisonAccordion
        translations={[...ENGLISH_VERSIONS, SWAHILI_VERSION]}
      />,
    );

    expect(screen.queryByText('Hapo mwanzo')).not.toBeInTheDocument();
    expect(screen.getByText('3 versions')).toBeInTheDocument();
  });

  it('shows the verse straight away when there is only one version', () => {
    // The mocked reader language is "en", so a single English version has
    // nothing to compare.
    render(<TranslationComparisonAccordion translations={[ENGLISH_VERSIONS[0]]} />);

    // Nothing to choose between, so there is no accordion to open.
    expect(screen.queryByRole('button', { name: /Translation Versions/i })).toBeNull();
    expect(screen.getByText('King James Version')).toBeInTheDocument();
  });
});
