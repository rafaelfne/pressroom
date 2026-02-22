import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup, within, screen } from '@testing-library/react';
import { PageSettingsPanel } from '@/components/studio/page-settings-panel';
import { DEFAULT_PAGE_CONFIG } from '@/lib/types/page-config';

describe('PageSettingsPanel', () => {
    const mockOnConfigChange = vi.fn();
    const mockOnPageTitleChange = vi.fn();

    const defaultProps = {
        config: DEFAULT_PAGE_CONFIG,
        onConfigChange: mockOnConfigChange,
        pageTitle: 'Test Page',
        onPageTitleChange: mockOnPageTitleChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the panel', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        expect(panel).toBeInTheDocument();
    });

    it('displays page title input with current value', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const titleInput = within(panel).getByTestId('page-title-input') as HTMLInputElement;
        expect(titleInput.value).toBe('Test Page');
    });

    it('calls onPageTitleChange when title input is blurred', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const titleInput = within(panel).getByTestId('page-title-input');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });
        fireEvent.blur(titleInput);
        expect(mockOnPageTitleChange).toHaveBeenCalledWith('New Title');
    });

    it('displays current paper size in select', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const trigger = within(panel).getByTestId('paper-size-select');
        expect(trigger).toHaveTextContent('A4');
    });

    it('shows dimensions label for named paper sizes', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        expect(within(container).getByText(/A4 \(794 × 1123 px\)/)).toBeInTheDocument();
    });

    it('calls onConfigChange when paper size is changed', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const trigger = within(panel).getByTestId('paper-size-select');

        // Open the Radix Select dropdown via fireEvent.click
        fireEvent.click(trigger);

        // Click the "Letter" option from the portal
        const option = screen.getByRole('option', { name: 'Letter' });
        fireEvent.click(option);

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                paperSize: 'Letter',
            }),
        );
    });

    it('shows custom dimension inputs when Custom is selected', () => {
        const customConfig = { ...DEFAULT_PAGE_CONFIG, paperSize: 'Custom' as const };
        const { container } = render(
            <PageSettingsPanel {...defaultProps} config={customConfig} />,
        );
        const panel = within(container).getByTestId('page-settings-panel');
        expect(within(panel).getByTestId('custom-width')).toBeInTheDocument();
        expect(within(panel).getByTestId('custom-height')).toBeInTheDocument();
    });

    it('highlights active orientation button', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const portraitBtn = within(panel).getByTestId('orientation-portrait');
        const landscapeBtn = within(panel).getByTestId('orientation-landscape');

        expect(portraitBtn).toHaveAttribute('data-state', 'on');
        expect(landscapeBtn).toHaveAttribute('data-state', 'off');
    });

    it('calls onConfigChange when orientation is switched', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const landscapeBtn = within(panel).getByTestId('orientation-landscape');
        fireEvent.click(landscapeBtn);

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                orientation: 'landscape',
            }),
        );
    });

    it('displays all four margin inputs with correct values', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');

        const topInput = within(panel).getByTestId('margin-top') as HTMLInputElement;
        const rightInput = within(panel).getByTestId('margin-right') as HTMLInputElement;
        const bottomInput = within(panel).getByTestId('margin-bottom') as HTMLInputElement;
        const leftInput = within(panel).getByTestId('margin-left') as HTMLInputElement;

        expect(topInput.value).toBe('21');
        expect(rightInput.value).toBe('21');
        expect(bottomInput.value).toBe('21');
        expect(leftInput.value).toBe('21');
    });

    it('highlights correct margin preset', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const normalPreset = within(panel).getByTestId('margin-preset-normal');
        expect(normalPreset).toHaveAttribute('data-state', 'on');
    });

    it('calls onConfigChange when margin preset is clicked', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const narrowPreset = within(panel).getByTestId('margin-preset-narrow');
        fireEvent.click(narrowPreset);

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                margins: expect.objectContaining({
                    top: 11,
                    right: 11,
                    bottom: 11,
                    left: 11,
                }),
            }),
        );
    });

    it('calls onConfigChange when margin input is blurred', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const topInput = within(panel).getByTestId('margin-top');

        fireEvent.change(topInput, { target: { value: '30' } });
        fireEvent.blur(topInput);

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
        const { container } = render(
            <PageSettingsPanel {...defaultProps} config={customConfig} />,
        );
        const panel = within(container).getByTestId('page-settings-panel');
        const customPreset = within(panel).getByTestId('margin-preset-custom');
        expect(customPreset).toHaveAttribute('data-state', 'on');
    });
});
