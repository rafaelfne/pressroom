import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { UserAvatar } from '@/components/ui/user-avatar';

describe('UserAvatar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders initials correctly for full name', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('JD');
  });

  it('renders initials for single name', () => {
    render(<UserAvatar name="John" identifier="john@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveTextContent('J');
  });

  it('renders "?" for null name', () => {
    render(<UserAvatar name={null} identifier="user@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveTextContent('?');
  });

  it('renders "?" for undefined name', () => {
    render(<UserAvatar name={undefined} identifier="user@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveTextContent('?');
  });

  it('applies background color based on identifier', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    const backgroundColor = avatar.style.backgroundColor;
    expect(backgroundColor).toBeTruthy();
    // Browser converts HSL to RGB, so just check that a color is applied
    expect(backgroundColor).toMatch(/^rgb/);
  });

  it('applies md size by default', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('h-9', 'w-9', 'text-sm');
  });

  it('applies sm size when specified', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" size="sm" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('h-8', 'w-8', 'text-xs');
  });

  it('applies custom className', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" className="custom-class" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('custom-class');
  });

  it('applies consistent color for same identifier', () => {
    const { rerender } = render(<UserAvatar name="John" identifier="test@example.com" />);
    const avatar1 = screen.getByTestId('user-avatar');
    const color1 = avatar1.style.backgroundColor;

    rerender(<UserAvatar name="Jane" identifier="test@example.com" />);
    const avatar2 = screen.getByTestId('user-avatar');
    const color2 = avatar2.style.backgroundColor;

    expect(color1).toBe(color2);
  });

  it('has rounded-full class', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('rounded-full');
  });

  it('has white text color', () => {
    render(<UserAvatar name="John Doe" identifier="john@example.com" />);

    const avatar = screen.getByTestId('user-avatar');
    expect(avatar).toHaveClass('text-white');
  });
});
