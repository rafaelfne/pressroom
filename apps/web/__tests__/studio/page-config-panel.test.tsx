import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { PageConfigPanel } from '@/components/studio/page-config-panel';
import { DEFAULT_PAGE_CONFIG } from '@/lib/types/page-config';

describe('PageConfigPanel', () => {
    const mockOnConfigChange = vi.fn();

    const defaultProps = {
        config: DEFAULT_PAGE_CONFIG,
        onConfigChange: mockOnConfigChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the panel', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        expect(panel).toBeInTheDocument();
    });

    it('displays current paper size in select', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const select = within(panel).getByTestId('paper-size-select') as HTMLSelectElement;
        expect(select.value).toBe('A4');
    });

    it('shows dimensions label for named paper sizes', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        expect(within(container).getByText(/A4 \(595 × 842 px\)/)).toBeInTheDocument();
    });

    it('calls onConfigChange when Custom paper size is selected', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const select = within(panel).getByTestId('paper-size-select');
        fireEvent.change(select, { target: { value: 'Custom' } });

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                paperSize: 'Custom',
            }),
        );
    });

    it('highlights active orientation button', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const portraitBtn = within(panel).getByTestId('orientation-portrait');
        const landscapeBtn = within(panel).getByTestId('orientation-landscape');

        // Portrait should be active (default)
        expect(portraitBtn.className).toContain('bg-primary');
        expect(landscapeBtn.className).not.toContain('bg-primary');
    });

    it('calls onConfigChange when orientation is switched', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const landscapeBtn = within(panel).getByTestId('orientation-landscape');
        fireEvent.click(landscapeBtn);

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                orientation: 'landscape',
            }),
        );
    });

    it('displays all four margin inputs with correct values', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');

        const topInput = within(panel).getByTestId('margin-top') as HTMLInputElement;
        const rightInput = within(panel).getByTestId('margin-right') as HTMLInputElement;
        const bottomInput = within(panel).getByTestId('margin-bottom') as HTMLInputElement;
        const leftInput = within(panel).getByTestId('margin-left') as HTMLInputElement;

        expect(topInput.value).toBe('16');
        expect(rightInput.value).toBe('16');
        expect(bottomInput.value).toBe('16');
        expect(leftInput.value).toBe('16');
    });

    it('highlights correct margin preset', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const normalPreset = within(panel).getByTestId('margin-preset-normal');
        expect(normalPreset.className).toContain('bg-primary');
    });

    it('calls onConfigChange when margin preset is clicked', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const narrowPreset = within(panel).getByTestId('margin-preset-narrow');
        fireEvent.click(narrowPreset);

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                margins: expect.objectContaining({
                    top: 8,
                    right: 8,
                    bottom: 8,
                    left: 8,
                }),
            }),
        );
    });

    it('calls onConfigChange when margin input is changed', () => {
        const { container } = render(<PageConfigPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-config-panel');
        const topInput = within(panel).getByTestId('margin-top');

        fireEvent.change(topInput, { target: { value: '30' } });

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                margins: expect.objectContaining({
                    top: 30,
                }),
            }),
        );
    });

    it('shows custom preset as highlighted when margins do not match any preset', () => {
        const customConfig = {
            ...DEFAULT_PAGE_CONFIG,
            margins: { top: 15, right: 15, bottom: 15, left: 15 },
        };
        const { container } = render(<PageConfigPanel config={customConfig} onConfigChange={mockOnConfigChange} />);
        const panel = within(container).getByTestId('page-config-panel');

        const customPreset = within(panel).getByTestId('margin-preset-custom');
        expect(customPreset.className).toContain('bg-primary');
    });
});