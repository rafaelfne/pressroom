import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    styleGuide: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    template: {
      updateMany: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to create NextRequest
function createRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): NextRequest {
  const init: Record<string, unknown> = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new NextRequest(new URL(url, 'http://localhost:3000'), init as any);
}

const mockSession = {
  user: { id: 'user-1', email: 'test@test.com', name: 'Test User' },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const mockStyleGuide = {
  id: 'sg-1',
  name: 'Brand Colors',
  organizationId: 'org-1',
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  tokens: [
    {
      id: 'token-1',
      styleGuideId: 'sg-1',
      name: 'text-primary',
      label: 'Primary Text',
      category: 'color',
      cssProperty: 'color',
      value: '#000000',
      sortOrder: 0,
    },
  ],
};

describe('POST /api/style-guides', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { POST } = await import('@/app/api/style-guides/route');
    const request = createRequest('POST', '/api/style-guides', {
      name: 'Test Style Guide',
      organizationId: 'org-1',
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid input', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const { POST } = await import('@/app/api/style-guides/route');
    const request = createRequest('POST', '/api/style-guides', {});
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
  });

  it('creates style guide successfully without tokens', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.styleGuide.create).mockResolvedValue({
      ...mockStyleGuide,
      tokens: [],
    } as never);

    const { POST } = await import('@/app/api/style-guides/route');
    const request = createRequest('POST', '/api/style-guides', {
      name: 'Brand Colors',
      organizationId: 'org-1',
      isDefault: false,
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('Brand Colors');
    expect(prisma.styleGuide.create).toHaveBeenCalled();
  });

  it('creates style guide with tokens', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.styleGuide.create).mockResolvedValue(mockStyleGuide as never);

    const { POST } = await import('@/app/api/style-guides/route');
    const request = createRequest('POST', '/api/style-guides', {
      name: 'Brand Colors',
      organizationId: 'org-1',
      isDefault: true,
      tokens: [
        {
          name: 'text-primary',
          label: 'Primary Text',
          category: 'color',
          cssProperty: 'color',
          value: '#000000',
          sortOrder: 0,
        },
      ],
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('Brand Colors');
    expect(data.tokens).toHaveLength(1);
    expect(prisma.styleGuide.updateMany).toHaveBeenCalled(); // Called to unset other defaults
  });

  it('unsets existing defaults when isDefault is true', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.styleGuide.create).mockResolvedValue(mockStyleGuide as never);

    const { POST } = await import('@/app/api/style-guides/route');
    const request = createRequest('POST', '/api/style-guides', {
      name: 'New Default',
      organizationId: 'org-1',
      isDefault: true,
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(prisma.styleGuide.updateMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', isDefault: true },
      data: { isDefault: false },
    });
  });
});

describe('GET /api/style-guides', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { GET } = await import('@/app/api/style-guides/route');
    const request = createRequest('GET', '/api/style-guides?organizationId=org-1');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns 400 when organizationId is missing', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const { GET } = await import('@/app/api/style-guides/route');
    const request = createRequest('GET', '/api/style-guides');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
  });

  it('lists style guides for an organization', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findMany).mockResolvedValue([mockStyleGuide] as never);

    const { GET } = await import('@/app/api/style-guides/route');
    const request = createRequest('GET', '/api/style-guides?organizationId=org-1');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe('Brand Colors');
  });
});

describe('GET /api/style-guides/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { GET } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('GET', '/api/style-guides/sg-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(401);
  });

  it('returns 404 when style guide not found', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findUnique).mockResolvedValue(null as never);

    const { GET } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('GET', '/api/style-guides/sg-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Style guide not found');
  });

  it('returns style guide with tokens', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findUnique).mockResolvedValue(mockStyleGuide as never);

    const { GET } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('GET', '/api/style-guides/sg-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Brand Colors');
    expect(data.tokens).toHaveLength(1);
  });
});

describe('PUT /api/style-guides/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { PUT } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('PUT', '/api/style-guides/sg-1', {
      name: 'Updated Name',
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(401);
  });

  it('returns 404 when style guide not found', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findUnique).mockResolvedValue(null as never);

    const { PUT } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('PUT', '/api/style-guides/sg-1', {
      name: 'Updated Name',
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Style guide not found');
  });

  it('updates style guide name', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findUnique).mockResolvedValue(mockStyleGuide as never);
    vi.mocked(prisma.styleGuide.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.styleGuide.update).mockResolvedValue({
      ...mockStyleGuide,
      name: 'Updated Colors',
    } as never);

    const { PUT } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('PUT', '/api/style-guides/sg-1', {
      name: 'Updated Colors',
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Updated Colors');
  });

  it('updates tokens by replacing all', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findUnique).mockResolvedValue(mockStyleGuide as never);
    vi.mocked(prisma.styleGuide.updateMany).mockResolvedValue({ count: 0 } as never);
    const updatedStyleGuide = {
      ...mockStyleGuide,
      tokens: [
        {
          id: 'token-2',
          styleGuideId: 'sg-1',
          name: 'text-secondary',
          label: 'Secondary Text',
          category: 'color',
          cssProperty: 'color',
          value: '#666666',
          sortOrder: 0,
        },
      ],
    };
    vi.mocked(prisma.styleGuide.update).mockResolvedValue(updatedStyleGuide as never);

    const { PUT } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('PUT', '/api/style-guides/sg-1', {
      tokens: [
        {
          name: 'text-secondary',
          label: 'Secondary Text',
          category: 'color',
          cssProperty: 'color',
          value: '#666666',
          sortOrder: 0,
        },
      ],
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.tokens).toHaveLength(1);
    expect(data.tokens[0].name).toBe('text-secondary');
  });

  it('sets isDefault and unsets other defaults', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.styleGuide.findUnique).mockResolvedValue({
      ...mockStyleGuide,
      isDefault: false,
    } as never);
    vi.mocked(prisma.styleGuide.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.styleGuide.update).mockResolvedValue({
      ...mockStyleGuide,
      isDefault: true,
    } as never);

    const { PUT } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('PUT', '/api/style-guides/sg-1', {
      isDefault: true,
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(200);
    expect(prisma.styleGuide.updateMany).toHaveBeenCalledWith({
      where: {
        organizationId: mockStyleGuide.organizationId,
        isDefault: true,
        id: { not: 'sg-1' },
      },
      data: { isDefault: false },
    });
  });
});

describe('DELETE /api/style-guides/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { DELETE } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('DELETE', '/api/style-guides/sg-1');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(401);
  });

  it('deletes style guide and returns affected templates count', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.template.updateMany).mockResolvedValue({ count: 3 } as never);
    vi.mocked(prisma.styleGuide.delete).mockResolvedValue(mockStyleGuide as never);

    const { DELETE } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('DELETE', '/api/style-guides/sg-1');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Style guide deleted');
    expect(data.affectedTemplates).toBe(3);
    expect(prisma.template.updateMany).toHaveBeenCalledWith({
      where: { styleGuideId: 'sg-1' },
      data: { styleGuideId: null },
    });
  });

  it('returns 404 when style guide not found', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.template.updateMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.styleGuide.delete).mockRejectedValue({ code: 'P2025' } as never);

    const { DELETE } = await import('@/app/api/style-guides/[id]/route');
    const request = createRequest('DELETE', '/api/style-guides/sg-1');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'sg-1' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Style guide not found');
  });
});
