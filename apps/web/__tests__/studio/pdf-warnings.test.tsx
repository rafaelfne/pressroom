import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, within } from '@testing-library/react';
import { PdfWarnings } from '@/components/studio/pdf-warnings';

describe('PdfWarnings', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders nothing when no warnings apply', () => {
        const { container } = render(
            <PdfWarnings componentType="TextBlock" componentProps={{ text: 'Hello' }} />,
        );
        expect(container.querySelector('[data-testid="pdf-warnings"]')).not.toBeInTheDocument();
    });

    it('shows chart height warning when chart has no explicit height', () => {
        const { container } = render(
            <PdfWarnings componentType="ChartBlock" componentProps={{}} />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        expect(warnings).toBeInTheDocument();
        expect(within(warnings).getByText('Set explicit height for PDF rendering')).toBeInTheDocument();
    });

    it('does not show chart height warning when chart has explicit height', () => {
        const { container } = render(
            <PdfWarnings componentType="ChartBlock" componentProps={{ height: 300 }} />,
        );
        // Should not have the height warning
        const warningsEl = container.querySelector('[data-testid="pdf-warnings"]');
        if (warningsEl) {
            expect(within(warningsEl as HTMLElement).queryByText('Set explicit height for PDF rendering')).not.toBeInTheDocument();
        }
    });

    it('shows responsive container warning when props contain responsive', () => {
        const { container } = render(
            <PdfWarnings
                componentType="ChartBlock"
                componentProps={{ height: 300, useResponsiveContainer: true }}
            />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        expect(
            within(warnings).getByText('Use fixed dimensions for reliable PDF output'),
        ).toBeInTheDocument();
    });

    it('shows external image warning for http URLs', () => {
        const { container } = render(
            <PdfWarnings
                componentType="ImageBlock"
                componentProps={{ src: 'https://example.com/image.png' }}
            />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        expect(
            within(warnings).getByText('External images are converted to base64 in PDF'),
        ).toBeInTheDocument();
    });

    it('shows external image warning for protocol-relative URLs', () => {
        const { container } = render(
            <PdfWarnings
                componentType="ImageBlock"
                componentProps={{ src: '//example.com/image.png' }}
            />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        expect(
            within(warnings).getByText('External images are converted to base64 in PDF'),
        ).toBeInTheDocument();
    });

    it('does not show image warning for relative URLs', () => {
        const { container } = render(
            <PdfWarnings
                componentType="ImageBlock"
                componentProps={{ src: '/assets/logo.png' }}
            />,
        );
        expect(container.querySelector('[data-testid="pdf-warnings"]')).not.toBeInTheDocument();
    });

    it('shows large dataset warning for tables with >100 items', () => {
        const largeData = Array.from({ length: 101 }, (_, i) => ({ id: i }));
        const { container } = render(
            <PdfWarnings
                componentType="DataTable"
                componentProps={{ data: largeData }}
            />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        expect(
            within(warnings).getByText('Large datasets may cause pagination issues in PDF'),
        ).toBeInTheDocument();
    });

    it('does not show table warning for small datasets', () => {
        const smallData = Array.from({ length: 10 }, (_, i) => ({ id: i }));
        const { container } = render(
            <PdfWarnings
                componentType="DataTable"
                componentProps={{ data: smallData }}
            />,
        );
        expect(container.querySelector('[data-testid="pdf-warnings"]')).not.toBeInTheDocument();
    });

    it('shows multiple warnings when applicable', () => {
        const { container } = render(
            <PdfWarnings
                componentType="ChartBlock"
                componentProps={{ useResponsiveContainer: true }}
            />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        // Should have both chart height + responsive warnings
        expect(within(warnings).getByTestId('pdf-warning-0')).toBeInTheDocument();
        expect(within(warnings).getByTestId('pdf-warning-1')).toBeInTheDocument();
    });

    it('renders warning icons', () => {
        const { container } = render(
            <PdfWarnings componentType="ChartBlock" componentProps={{}} />,
        );
        const warnings = within(container).getByTestId('pdf-warnings');
        // Lucide AlertTriangle renders as an SVG
        const svg = warnings.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });
});
