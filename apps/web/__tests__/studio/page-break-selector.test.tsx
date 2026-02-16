import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { PageBreakSelector } from '@/components/studio/page-break-selector';

describe('PageBreakSelector', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the selector with all options', () => {
        const { container } = render(
            <PageBreakSelector value="auto" onChange={mockOnChange} />,
        );
        const selector = within(container).getByTestId('page-break-selector');
        expect(selector).toBeInTheDocument();
        expect(within(selector).getByTestId('page-break-auto')).toBeInTheDocument();
        expect(within(selector).getByTestId('page-break-avoid')).toBeInTheDocument();
        expect(within(selector).getByTestId('page-break-before')).toBeInTheDocument();
        expect(within(selector).getByTestId('page-break-after')).toBeInTheDocument();
    });

    it('shows auto as selected by default', () => {
        const { container } = render(
            <PageBreakSelector value="auto" onChange={mockOnChange} />,
        );
        const selector = within(container).getByTestId('page-break-selector');
        const autoRadio = within(selector).getByTestId('page-break-auto') as HTMLInputElement;
        expect(autoRadio.checked).toBe(true);
    });

    it('shows the correct option as selected', () => {
        const { container } = render(
            <PageBreakSelector value="before" onChange={mockOnChange} />,
        );
        const selector = within(container).getByTestId('page-break-selector');
        const beforeRadio = within(selector).getByTestId('page-break-before') as HTMLInputElement;
        const autoRadio = within(selector).getByTestId('page-break-auto') as HTMLInputElement;
        expect(beforeRadio.checked).toBe(true);
        expect(autoRadio.checked).toBe(false);
    });

    it('calls onChange when an option is selected', () => {
        const { container } = render(
            <PageBreakSelector value="auto" onChange={mockOnChange} />,
        );
        const selector = within(container).getByTestId('page-break-selector');
        const avoidRadio = within(selector).getByTestId('page-break-avoid');
        fireEvent.click(avoidRadio);
        expect(mockOnChange).toHaveBeenCalledWith('avoid');
    });

    it('displays description text for each option', () => {
        const { container } = render(
            <PageBreakSelector value="auto" onChange={mockOnChange} />,
        );
        expect(within(container).getByText('Let the PDF engine decide where to break')).toBeInTheDocument();
        expect(within(container).getByText('Try to keep this block on one page')).toBeInTheDocument();
        expect(within(container).getByText('Always start this block on a new page')).toBeInTheDocument();
        expect(within(container).getByText('Always start a new page after this block')).toBeInTheDocument();
    });

    it('displays labels for each option', () => {
        const { container } = render(
            <PageBreakSelector value="auto" onChange={mockOnChange} />,
        );
        expect(within(container).getByText('Auto')).toBeInTheDocument();
        expect(within(container).getByText('Avoid')).toBeInTheDocument();
        expect(within(container).getByText('Before')).toBeInTheDocument();
        expect(within(container).getByText('After')).toBeInTheDocument();
    });
});
