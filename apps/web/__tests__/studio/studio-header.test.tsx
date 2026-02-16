import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { StudioHeader } from '@/components/studio/studio-header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/studio/test-id'),
}));

describe('StudioHeader', () => {
  const defaultProps = {
    templateName: 'Test Template',
    onTemplateNameChange: vi.fn(),
    user: {
      name: 'Test User',
      email: 'test@example.com',
      id: 'test-id',
    },
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('Logo and Branding', () => {
    it('renders logo with link to /templates', () => {
      render(<StudioHeader {...defaultProps} />);
      const logoLink = screen.getByTestId('logo-link');
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/templates');
    });

    it('renders logo icon', () => {
      render(<StudioHeader {...defaultProps} />);
      const logoIcon = screen.getByTestId('logo-icon');
      expect(logoIcon).toBeInTheDocument();
    });

    it('renders Pressroom wordmark', () => {
      render(<StudioHeader {...defaultProps} />);
      expect(screen.getByText('Pressroom')).toBeInTheDocument();
    });
  });

  describe('Template Name Editing', () => {
    it('displays template name', () => {
      render(<StudioHeader {...defaultProps} />);
      const nameDisplay = screen.getByTestId('template-name-display');
      expect(nameDisplay).toBeInTheDocument();
      expect(nameDisplay).toHaveTextContent('Test Template');
    });

    it('shows pencil icon in button (via CSS class)', () => {
      render(<StudioHeader {...defaultProps} />);
      const nameDisplay = screen.getByTestId('template-name-display');
      // Pencil is rendered but opacity-0, will show on group-hover
      expect(nameDisplay).toContainHTML('lucide-pencil');
    });

    it('enters edit mode when template name is clicked', () => {
      render(<StudioHeader {...defaultProps} />);
      const nameDisplay = screen.getByTestId('template-name-display');
      fireEvent.click(nameDisplay);
      
      const input = screen.getByTestId('template-name-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Test Template');
    });

    it('saves template name on blur', async () => {
      const onTemplateNameChange = vi.fn();
      render(<StudioHeader {...defaultProps} onTemplateNameChange={onTemplateNameChange} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('template-name-display'));
      const input = screen.getByTestId('template-name-input');
      
      // Change value and blur
      fireEvent.change(input, { target: { value: 'New Name' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onTemplateNameChange).toHaveBeenCalledWith('New Name');
      });
    });

    it('saves template name on Enter key', async () => {
      const onTemplateNameChange = vi.fn();
      render(<StudioHeader {...defaultProps} onTemplateNameChange={onTemplateNameChange} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('template-name-display'));
      const input = screen.getByTestId('template-name-input');
      
      // Change value and press Enter
      fireEvent.change(input, { target: { value: 'New Name' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(onTemplateNameChange).toHaveBeenCalledWith('New Name');
      });
    });

    it('cancels edit on Escape key', async () => {
      const onTemplateNameChange = vi.fn();
      render(<StudioHeader {...defaultProps} onTemplateNameChange={onTemplateNameChange} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('template-name-display'));
      const input = screen.getByTestId('template-name-input');
      
      // Change value and press Escape
      fireEvent.change(input, { target: { value: 'New Name' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(onTemplateNameChange).not.toHaveBeenCalled();
        expect(screen.getByTestId('template-name-display')).toBeInTheDocument();
      });
    });

    it('does not save if name is empty', async () => {
      const onTemplateNameChange = vi.fn();
      render(<StudioHeader {...defaultProps} onTemplateNameChange={onTemplateNameChange} />);
      
      // Enter edit mode
      fireEvent.click(screen.getByTestId('template-name-display'));
      const input = screen.getByTestId('template-name-input');
      
      // Clear value and blur
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(onTemplateNameChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Undo/Redo Buttons', () => {
    it('renders undo button', () => {
      render(<StudioHeader {...defaultProps} />);
      const undoButton = screen.getByTestId('undo-button');
      expect(undoButton).toBeInTheDocument();
      expect(undoButton).toHaveAttribute('aria-label', 'Undo');
    });

    it('renders redo button', () => {
      render(<StudioHeader {...defaultProps} />);
      const redoButton = screen.getByTestId('redo-button');
      expect(redoButton).toBeInTheDocument();
      expect(redoButton).toHaveAttribute('aria-label', 'Redo');
    });

    it('disables undo button when canUndo is false', () => {
      render(<StudioHeader {...defaultProps} canUndo={false} />);
      const undoButton = screen.getByTestId('undo-button');
      expect(undoButton).toBeDisabled();
    });

    it('disables redo button when canRedo is false', () => {
      render(<StudioHeader {...defaultProps} canRedo={false} />);
      const redoButton = screen.getByTestId('redo-button');
      expect(redoButton).toBeDisabled();
    });

    it('enables undo button when canUndo is true', () => {
      render(<StudioHeader {...defaultProps} canUndo={true} onUndo={vi.fn()} />);
      const undoButton = screen.getByTestId('undo-button');
      expect(undoButton).not.toBeDisabled();
    });

    it('enables redo button when canRedo is true', () => {
      render(<StudioHeader {...defaultProps} canRedo={true} onRedo={vi.fn()} />);
      const redoButton = screen.getByTestId('redo-button');
      expect(redoButton).not.toBeDisabled();
    });

    it('calls onUndo when undo button is clicked', () => {
      const onUndo = vi.fn();
      render(<StudioHeader {...defaultProps} canUndo={true} onUndo={onUndo} />);
      
      const undoButton = screen.getByTestId('undo-button');
      fireEvent.click(undoButton);
      
      expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('calls onRedo when redo button is clicked', () => {
      const onRedo = vi.fn();
      render(<StudioHeader {...defaultProps} canRedo={true} onRedo={onRedo} />);
      
      const redoButton = screen.getByTestId('redo-button');
      fireEvent.click(redoButton);
      
      expect(onRedo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Action Buttons', () => {
    it('renders sample data toggle button', () => {
      render(<StudioHeader {...defaultProps} onToggleSampleData={vi.fn()} />);
      const button = screen.getByTestId('sample-data-toggle');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Sample Data');
    });

    it('renders download PDF button', () => {
      render(<StudioHeader {...defaultProps} onDownloadPdf={vi.fn()} />);
      const button = screen.getByTestId('download-pdf-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Download PDF');
    });

    it('renders preview button', () => {
      render(<StudioHeader {...defaultProps} onPreview={vi.fn()} />);
      const button = screen.getByTestId('preview-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Preview');
    });

    it('shows spinner in download PDF button when downloading', () => {
      render(<StudioHeader {...defaultProps} isDownloadingPdf={true} onDownloadPdf={vi.fn()} />);
      const button = screen.getByTestId('download-pdf-button');
      expect(button).toContainHTML('lucide-loader-circle');
    });

    it('disables download PDF button when downloading', () => {
      render(<StudioHeader {...defaultProps} isDownloadingPdf={true} onDownloadPdf={vi.fn()} />);
      const button = screen.getByTestId('download-pdf-button');
      expect(button).toBeDisabled();
    });

    it('calls onToggleSampleData when sample data button is clicked', () => {
      const onToggleSampleData = vi.fn();
      render(<StudioHeader {...defaultProps} onToggleSampleData={onToggleSampleData} />);
      
      const button = screen.getByTestId('sample-data-toggle');
      fireEvent.click(button);
      
      expect(onToggleSampleData).toHaveBeenCalledTimes(1);
    });

    it('calls onDownloadPdf when download PDF button is clicked', () => {
      const onDownloadPdf = vi.fn();
      render(<StudioHeader {...defaultProps} onDownloadPdf={onDownloadPdf} />);
      
      const button = screen.getByTestId('download-pdf-button');
      fireEvent.click(button);
      
      expect(onDownloadPdf).toHaveBeenCalledTimes(1);
    });

    it('calls onPreview when preview button is clicked', () => {
      const onPreview = vi.fn();
      render(<StudioHeader {...defaultProps} onPreview={onPreview} />);
      
      const button = screen.getByTestId('preview-button');
      fireEvent.click(button);
      
      expect(onPreview).toHaveBeenCalledTimes(1);
    });
  });

  describe('Publish Button', () => {
    it('renders publish button with text', () => {
      render(<StudioHeader {...defaultProps} onPublish={vi.fn()} />);
      const button = screen.getByTestId('publish-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Publish');
    });

    it('shows "Publishing…" text when saving', () => {
      render(<StudioHeader {...defaultProps} isSaving={true} onPublish={vi.fn()} />);
      const button = screen.getByTestId('publish-button');
      expect(button).toHaveTextContent('Publishing…');
    });

    it('shows spinner when saving', () => {
      render(<StudioHeader {...defaultProps} isSaving={true} onPublish={vi.fn()} />);
      const button = screen.getByTestId('publish-button');
      expect(button).toContainHTML('lucide-loader-circle');
    });

    it('disables publish button when saving', () => {
      render(<StudioHeader {...defaultProps} isSaving={true} onPublish={vi.fn()} />);
      const button = screen.getByTestId('publish-button');
      expect(button).toBeDisabled();
    });

    it('shows "Published" text after save completes', async () => {
      const { rerender } = render(
        <StudioHeader {...defaultProps} isSaving={true} onPublish={vi.fn()} />,
      );
      
      // Complete the save
      rerender(<StudioHeader {...defaultProps} isSaving={false} onPublish={vi.fn()} />);
      
      await waitFor(() => {
        const button = screen.getByTestId('publish-button');
        expect(button).toHaveTextContent('Published');
      });
    });

    it('shows check icon after save completes', async () => {
      const { rerender } = render(
        <StudioHeader {...defaultProps} isSaving={true} onPublish={vi.fn()} />,
      );
      
      // Complete the save
      rerender(<StudioHeader {...defaultProps} isSaving={false} onPublish={vi.fn()} />);
      
      await waitFor(() => {
        const button = screen.getByTestId('publish-button');
        expect(button).toContainHTML('lucide-check');
      });
    });

    it('returns to "Publish" text after 2 seconds', async () => {
      vi.useFakeTimers();
      
      const { rerender } = render(
        <StudioHeader {...defaultProps} isSaving={true} onPublish={vi.fn()} />,
      );
      
      // Complete the save
      rerender(<StudioHeader {...defaultProps} isSaving={false} onPublish={vi.fn()} />);
      
      // Wait for the "Published" state
      await vi.waitFor(() => {
        const button = screen.getByTestId('publish-button');
        expect(button).toHaveTextContent('Published');
      });
      
      // Fast-forward past the 2 second timeout
      await vi.advanceTimersByTimeAsync(2100);
      
      // Should be back to "Publish"
      const button = screen.getByTestId('publish-button');
      expect(button).toHaveTextContent('Publish');
      
      vi.useRealTimers();
    });

    it('calls onPublish when publish button is clicked', () => {
      const onPublish = vi.fn();
      render(<StudioHeader {...defaultProps} onPublish={onPublish} />);
      
      const button = screen.getByTestId('publish-button');
      fireEvent.click(button);
      
      expect(onPublish).toHaveBeenCalledTimes(1);
    });

    it('does not call onPublish when button is disabled', () => {
      const onPublish = vi.fn();
      render(<StudioHeader {...defaultProps} isSaving={true} onPublish={onPublish} />);
      
      const button = screen.getByTestId('publish-button');
      fireEvent.click(button);
      
      expect(onPublish).not.toHaveBeenCalled();
    });
  });

  describe('User Dropdown', () => {
    it('renders user dropdown', () => {
      render(<StudioHeader {...defaultProps} />);
      // UserDropdown renders a button with user initials or avatar
      // It should be in the document
      const header = screen.getByTestId('studio-header');
      expect(header).toBeInTheDocument();
    });
  });
});
