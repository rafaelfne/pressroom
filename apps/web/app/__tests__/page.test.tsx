import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Home from '../page';

describe('Home page', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the app name', () => {
    render(<Home />);
    expect(screen.getByText('Pressroom')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Home />);
    expect(screen.getByText('Report generation platform')).toBeInTheDocument();
  });
});
