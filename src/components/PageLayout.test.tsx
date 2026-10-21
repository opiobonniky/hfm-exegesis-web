import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { PageLayout } from './PageLayout';

afterEach(cleanup);

it('preserves the default spacing for existing pages', () => {
  const { container } = render(<PageLayout><p>Content</p></PageLayout>);
  expect(container.firstElementChild).toHaveClass('min-h-screen');
  expect(screen.getByText('Content').parentElement).toHaveClass('py-8');
});

it('can avoid a second viewport and reduce bottom padding inside the app shell', () => {
  const { container } = render(<PageLayout className="min-h-0" contentClassName="pb-3 md:pb-8"><p>Plans</p></PageLayout>);
  expect(container.firstElementChild).toHaveClass('min-h-0');
  expect(container.firstElementChild).not.toHaveClass('min-h-screen');
  expect(screen.getByText('Plans').parentElement).toHaveClass('pb-3', 'md:pb-8', 'px-5');
});
