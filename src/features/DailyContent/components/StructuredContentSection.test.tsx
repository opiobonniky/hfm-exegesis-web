import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { StructuredContentSection } from './StructuredContentSection';

vi.mock('@/components/languages/hardcodedTranslate', () => ({ tt: (text: string) => text }));
vi.mock('../hooks/usePassagePreview', () => ({
  usePassagePreview: () => ({ verseNumbers: [5], text: 'Ask God.', loading: false }),
}));

it('follows the document from word study to takeaways, with commentary for cross references', () => {
  const update = vi.fn();
  render(<StructuredContentSection wordStudies="" setWordStudies={update}
    practicalApplications="" setPracticalApplications={update} keyThemes="" setKeyThemes={update}
    crossReferences='[{"bookName":"James","chapter":1,"verseNumber":5,"referenceText":"Ask God."}]'
    setCrossReferences={update} finalThoughts="" setFinalThoughts={update}
    takeaways="" setTakeaways={update} bibleVersion="BSB" isRtl={false} />);

  const fields = [
    'Strong’s Concordance Word Study', 'Practical Applications', 'Insights and Cross References',
    'Key Themes', 'Cross references', 'Commentary', 'Final Thoughts', 'Takeaways',
  ].map(label => screen.getByText(label));
  fields.slice(1).forEach((field, index) => {
    expect(fields[index].compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
