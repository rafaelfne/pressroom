import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TemplateCard } from '@/components/dashboard/template-card';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock server actions
vi.mock('@/lib/templates/actions', () => ({
  duplicateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}));

const baseTemplate = {
  id: 'template-1',
  name: 'Monthly Report',
  description: 'A comprehensive monthly report template',
  tags: ['finance', 'monthly'],
  updatedAt: new Date('2025-01-15T10:00:00Z'),
  templateData: { content: [], root: {} },
};

describe('TemplateCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the template name', () => {
    render(<TemplateCard template={baseTemplate} />);
    expect(screen.getByText('Monthly Report')).toBeInTheDocument();
  });

  it('renders the template description', () => {
    render(<TemplateCard template={baseTemplate} />);
    expect(screen.getByText('A comprehensive monthly report template')).toBeInTheDocument();
  });

  it('renders "No description" when description is null', () => {
    const template = { ...baseTemplate, description: null };
    render(<TemplateCard template={template} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders tags as badges', () => {
    render(<TemplateCard template={baseTemplate} />);
    expect(screen.getByText('finance')).toBeInTheDocument();
    expect(screen.getByText('monthly')).toBeInTheDocument();
  });

  it('shows remaining tags count when more than 3 tags', () => {
    const template = {
      ...baseTemplate,
      tags: ['finance', 'monthly', 'report', 'quarterly', 'analytics'],
    };
    render(<TemplateCard template={template} />);
    expect(screen.getByText('finance')).toBeInTheDocument();
    expect(screen.getByText('monthly')).toBeInTheDocument();
    expect(screen.getByText('report')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('does not render tags section when there are no tags', () => {
    const template = { ...baseTemplate, tags: [] };
    render(<TemplateCard template={template} />);
    expect(screen.queryByText('finance')).not.toBeInTheDocument();
  });

  it('renders the formatted date', () => {
    render(<TemplateCard template={baseTemplate} />);
    const dateElement = screen.getByText(/Updated/);
    expect(dateElement).toBeInTheDocument();
    expect(dateElement.textContent).toContain('Jan');
    expect(dateElement.textContent).toContain('2025');
  });

  it('links to the studio page', () => {
    render(<TemplateCard template={baseTemplate} />);
    const link = screen.getByText('Monthly Report').closest('a');
    expect(link).toHaveAttribute('href', '/studio/template-1');
  });

  it('renders the dropdown menu trigger', () => {
    render(<TemplateCard template={baseTemplate} />);
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });
});
