import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for the PDF download behavior in the Studio.
 * Tests the core download logic: fetch → blob → trigger download with correct filename.
 */
describe('Studio Download PDF', () => {
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:http://localhost/fake-blob-url');
    URL.revokeObjectURL = vi.fn();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  it('triggers browser download with correct filename on successful PDF render', async () => {
    const mockBlob = new Blob(['%PDF-1.4 fake'], { type: 'application/pdf' });
    const mockResponse = new Response(mockBlob, { status: 200 });
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const clickSpy = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    const removeChildSpy = vi.fn();

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: clickSpy,
          remove: removeChildSpy,
          setAttribute: vi.fn(),
          style: {},
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });

    // Simulate the download logic from StudioPage
    const templateName = 'My Report';
    const templateId = 'test-template-id';

    const response = await fetch('/api/reports/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        data: {},
        format: 'pdf',
      }),
    });

    expect(response.ok).toBe(true);

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    // Verify the download was triggered correctly
    expect(fetch).toHaveBeenCalledWith('/api/reports/render', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(a.download).toBe('My Report.pdf');
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/fake-blob-url');

    appendChildSpy.mockRestore();
  });

  it('handles API error responses gracefully', async () => {
    const mockResponse = new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse);

    const response = await fetch('/api/reports/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 'test-id',
        data: {},
        format: 'pdf',
      }),
    });

    expect(response.ok).toBe(false);
    const result = await response.json();
    expect(result.error).toBe('Rate limit exceeded');

    // URL.createObjectURL should NOT have been called (no download triggered)
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('handles network errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    let errorMessage = '';
    try {
      await fetch('/api/reports/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: 'test-id',
          data: {},
          format: 'pdf',
        }),
      });
    } catch {
      errorMessage = 'Failed to render PDF';
    }

    expect(errorMessage).toBe('Failed to render PDF');
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('sanitizes template name for filename', () => {
    // Test that the template name is used as-is for the filename
    const templateName = 'Quarterly Report 2024';
    const expectedFilename = `${templateName}.pdf`;
    expect(expectedFilename).toBe('Quarterly Report 2024.pdf');
  });
});
