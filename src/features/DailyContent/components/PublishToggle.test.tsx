import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PublishToggle } from './PublishToggle';

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe('PublishToggle', () => {
  it('contains the Radix form input so it cannot create document overflow', () => {
    const { container } = render(
      <form>
        <PublishToggle published onCheckedChange={vi.fn()} />
      </form>,
    );

    const toggle = screen.getByRole('switch');
    expect(toggle.parentElement).toHaveClass('relative');
    expect(container.querySelector('input[type="checkbox"][aria-hidden="true"]')).toBeInTheDocument();
  });
});
