import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import type { Data } from '@puckeditor/core';
import type { RequestInit } from 'next/dist/server/web/spec-extension/request';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    template: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock render-report module for dynamic import
vi.mock('@/lib/rendering/render-report', () => ({
  renderReport: vi.fn(),
}));

// Mock rate limiter
vi.mock('@/lib/rendering/rate-limiter', () => ({
  checkRateLimit: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderReport } from '@/lib/rendering/render-report';
import { checkRateLimit } from '@/lib/rendering/rate-limiter';

// Helper to create NextRequest
function createRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): NextRequest {
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  return new NextRequest(new URL(url, 'http://localhost:3000'), init);
}

const mockSession = {
  user: { id: 'user-1', email: 'test@test.com', name: 'Test User' },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const mockUser = { organizationId: 'org-1' };

const mockTemplate = {
  id: 'tpl-1',
  name: 'Test Template',
  templateData: {
    content: [],
    root: {},
  } as Data,
  organizationId: 'org-1',
};

describe('POST /api/reports/render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: rate limit allows requests
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      limit: 10,
      remaining: 9,
      resetAt: Math.floor(Date.now() / 1000) + 60,
    });
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateId: 'tpl-1',
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid JSON', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const { POST } = await import('@/app/api/reports/render/route');
    const request = new NextRequest(new URL('http://localhost:3000/api/reports/render'), {
      method: 'POST',
      body: 'invalid json',
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid JSON body');
  });

  it('returns 400 for validation failure', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      // Missing both templateId and templateData
      data: { key: 'value' },
    });
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
  });

  it('renders with templateId successfully', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: Buffer.from('mock-pdf'),
      contentType: 'application/pdf',
    });

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateId: 'tpl-1',
      data: { key: 'value' },
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('report.pdf');
    expect(renderReport).toHaveBeenCalledWith({
      templateData: mockTemplate.templateData,
      data: { key: 'value' },
      format: 'pdf',
      pageConfig: undefined,
    });
  });

  it('renders with inline templateData successfully', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: Buffer.from('mock-pdf'),
      contentType: 'application/pdf',
    });

    const templateData = {
      content: [],
      root: {},
    };

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData,
      format: 'pdf',
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(prisma.template.findFirst).not.toHaveBeenCalled();
    expect(renderReport).toHaveBeenCalledWith({
      templateData,
      data: undefined,
      format: 'pdf',
      pageConfig: undefined,
    });
  });

  it('returns HTML when format is html', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: '<html><body>Test</body></html>',
      contentType: 'text/html',
    });

    const templateData = {
      content: [],
      root: {},
    };

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData,
      format: 'html',
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8');
    const text = await response.text();
    expect(text).toBe('<html><body>Test</body></html>');
  });

  it('returns 403 when user has no organization', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ organizationId: null } as never);

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateId: 'tpl-1',
    });
    const response = await POST(request);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('User has no organization');
  });

  it('returns 404 when template not found', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(null);

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateId: 'non-existent',
    });
    const response = await POST(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Template not found');
  });

  it('passes pageConfig to renderReport', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: Buffer.from('mock-pdf'),
      contentType: 'application/pdf',
    });

    const templateData = {
      content: [],
      root: {},
    };

    const pageConfig = {
      format: 'A3' as const,
      orientation: 'landscape' as const,
      margin: {
        top: '10mm',
      },
    };

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData,
      pageConfig,
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(renderReport).toHaveBeenCalledWith({
      templateData,
      data: undefined,
      format: 'pdf',
      pageConfig,
    });
  });

  it('returns 500 on rendering error', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockRejectedValue(new Error('Rendering failed'));

    const templateData = {
      content: [],
      root: {},
    };

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData,
    });
    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Internal server error');
  });

  it('queries template with correct filters', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: Buffer.from('mock-pdf'),
      contentType: 'application/pdf',
    });

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateId: 'tpl-1',
    });
    await POST(request);

    expect(prisma.template.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'tpl-1',
        organizationId: 'org-1',
        deletedAt: null,
      },
    });
  });

  it('passes data object to renderReport', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: Buffer.from('mock-pdf'),
      contentType: 'application/pdf',
    });

    const templateData = {
      content: [],
      root: {},
    };

    const data = {
      items: [1, 2, 3],
      name: 'John',
    };

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData,
      data,
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(renderReport).toHaveBeenCalledWith({
      templateData,
      data,
      format: 'pdf',
      pageConfig: undefined,
    });
  });

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      limit: 10,
      remaining: 0,
      resetAt: 1700000000,
    });

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData: { content: [], root: {} },
    });
    const response = await POST(request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain('Rate limit exceeded');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('X-RateLimit-Reset')).toBe('1700000000');
  });

  it('calls checkRateLimit with user id', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockResolvedValue({
      content: Buffer.from('mock-pdf'),
      contentType: 'application/pdf',
    });

    const { POST } = await import('@/app/api/reports/render/route');
    const request = createRequest('POST', '/api/reports/render', {
      templateData: { content: [], root: {} },
    });
    await POST(request);

    expect(checkRateLimit).toHaveBeenCalledWith('user-1');
  });

  it('returns 504 when render times out', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(renderReport).mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    // Set a very short timeout for testing
    const originalEnv = process.env.RENDER_TIMEOUT_MS;
    process.env.RENDER_TIMEOUT_MS = '50';

    try {
      const { POST } = await import('@/app/api/reports/render/route');
      const request = createRequest('POST', '/api/reports/render', {
        templateData: { content: [], root: {} },
      });
      const response = await POST(request);

      expect(response.status).toBe(504);
      const data = await response.json();
      expect(data.error).toBe('Render timeout exceeded');
    } finally {
      if (originalEnv === undefined) {
        delete process.env.RENDER_TIMEOUT_MS;
      } else {
        process.env.RENDER_TIMEOUT_MS = originalEnv;
      }
    }
  });
});
