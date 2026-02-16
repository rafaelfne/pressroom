import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, cleanup, within } from '@testing-library/react';
import { PageSettingsPanel } from '@/components/studio/page-settings-panel';
import { DEFAULT_PAGE_CONFIG } from '@/lib/types/page-config';
import { DEFAULT_HEADER_FOOTER_CONFIG } from '@/lib/types/header-footer-config';

describe('PageSettingsPanel', () => {
    const mockOnConfigChange = vi.fn();
    const mockOnPageTitleChange = vi.fn();
    const mockOnHeaderFooterConfigChange = vi.fn();

    const defaultProps = {
        config: DEFAULT_PAGE_CONFIG,
        onConfigChange: mockOnConfigChange,
        pageTitle: 'Test Page',
        onPageTitleChange: mockOnPageTitleChange,
        headerFooterConfig: DEFAULT_HEADER_FOOTER_CONFIG,
        onHeaderFooterConfigChange: mockOnHeaderFooterConfigChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the panel with "Page" title', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        expect(panel).toBeInTheDocument();
        expect(within(panel).getByText('Page')).toBeInTheDocument();
    });

    it('displays page title input with current value', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const titleInput = within(panel).getByTestId('page-title-input') as HTMLInputElement;
        expect(titleInput.value).toBe('Test Page');
    });

    it('calls onPageTitleChange when title input is changed', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const titleInput = within(panel).getByTestId('page-title-input');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });
        expect(mockOnPageTitleChange).toHaveBeenCalledWith('New Title');
    });

    it('displays current paper size in select', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const select = within(panel).getByTestId('paper-size-select') as HTMLSelectElement;
        expect(select.value).toBe('A4');
    });

    it('shows dimensions label for named paper sizes', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        expect(within(container).getByText(/A4 \(210 × 297 mm\)/)).toBeInTheDocument();
    });

    it('calls onConfigChange when paper size is changed', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const select = within(panel).getByTestId('paper-size-select');
        fireEvent.change(select, { target: { value: 'Letter' } });

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

        expect(portraitBtn.className).toContain('bg-primary');
        expect(landscapeBtn.className).not.toContain('bg-primary');
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

        expect(topInput.value).toBe('20');
        expect(rightInput.value).toBe('20');
        expect(bottomInput.value).toBe('20');
        expect(leftInput.value).toBe('20');
    });

    it('highlights correct margin preset', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const normalPreset = within(panel).getByTestId('margin-preset-normal');
        expect(normalPreset.className).toContain('bg-primary');
    });

    it('calls onConfigChange when margin preset is clicked', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const narrowPreset = within(panel).getByTestId('margin-preset-narrow');
        fireEvent.click(narrowPreset);

        expect(mockOnConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                margins: expect.objectContaining({
                    top: 12.7,
                    right: 12.7,
                    bottom: 12.7,
                    left: 12.7,
                }),
            }),
        );
    });

    it('calls onConfigChange when margin input is changed', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
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
        const { container } = render(
            <PageSettingsPanel {...defaultProps} config={customConfig} />,
        );
        const panel = within(container).getByTestId('page-settings-panel');
        const customPreset = within(panel).getByTestId('margin-preset-custom');
        expect(customPreset.className).toContain('bg-primary');
    });

    // Header/Footer section tests
    it('renders header checkbox', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const checkbox = within(panel).getByTestId('show-header-checkbox') as HTMLInputElement;
        expect(checkbox).toBeInTheDocument();
        expect(checkbox.checked).toBe(false); // defaults to disabled
    });

    it('renders footer checkbox', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const checkbox = within(panel).getByTestId('show-footer-checkbox') as HTMLInputElement;
        expect(checkbox).toBeInTheDocument();
        expect(checkbox.checked).toBe(false);
    });

    it('calls onHeaderFooterConfigChange when header checkbox is toggled', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const checkbox = within(panel).getByTestId('show-header-checkbox');
        fireEvent.click(checkbox);

        expect(mockOnHeaderFooterConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                header: expect.objectContaining({
                    enabled: true,
                }),
            }),
        );
    });

    it('calls onHeaderFooterConfigChange when footer checkbox is toggled', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const checkbox = within(panel).getByTestId('show-footer-checkbox');
        fireEvent.click(checkbox);

        expect(mockOnHeaderFooterConfigChange).toHaveBeenCalledWith(
            expect.objectContaining({
                footer: expect.objectContaining({
                    enabled: true,
                }),
            }),
        );
    });

    it('renders configure header link (disabled)', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const link = within(panel).getByTestId('configure-header-link');
        expect(link).toBeInTheDocument();
        expect(link).toBeDisabled();
    });

    it('renders configure footer link (disabled)', () => {
        const { container } = render(<PageSettingsPanel {...defaultProps} />);
        const panel = within(container).getByTestId('page-settings-panel');
        const link = within(panel).getByTestId('configure-footer-link');
        expect(link).toBeInTheDocument();
        expect(link).toBeDisabled();
    });
});
