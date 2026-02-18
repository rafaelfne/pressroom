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

  it('renders the product description', () => {
    render(<Home />);
    expect(screen.getByText(/modern report generation platform/i)).toBeInTheDocument();
  });

  it('renders login and register CTAs', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /criar conta/i })).toHaveAttribute('href', '/register');
  });

  it('renders feature highlights', () => {
    render(<Home />);
    expect(screen.getByText('Visual Editor')).toBeInTheDocument();
    expect(screen.getByText('Data Binding')).toBeInTheDocument();
    expect(screen.getByText('PDF Generation')).toBeInTheDocument();
  });
});
