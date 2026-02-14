import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

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
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
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

const mockUser = { organizationId: 'org-1' };

const mockTemplate = {
  id: 'tpl-1',
  name: 'Test Template',
  description: 'A test template',
  templateData: { content: [], root: {} },
  sampleData: null,
  pageConfig: null,
  organizationId: 'org-1',
  createdById: 'user-1',
  version: 1,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('POST /api/templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { POST } = await import('@/app/api/templates/route');
    const request = createRequest('POST', '/api/templates', { name: 'Test' });
    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid input', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const { POST } = await import('@/app/api/templates/route');
    const request = createRequest('POST', '/api/templates', {});
    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
  });

  it('creates template successfully', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.create).mockResolvedValue(mockTemplate as never);

    const { POST } = await import('@/app/api/templates/route');
    const request = createRequest('POST', '/api/templates', {
      name: 'Test Template',
      description: 'A test template',
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('Test Template');
    expect(prisma.template.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Test Template',
          organizationId: 'org-1',
          createdById: 'user-1',
        }),
      }),
    );
  });
});

describe('GET /api/templates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { GET } = await import('@/app/api/templates/route');
    const request = createRequest('GET', '/api/templates');
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns paginated templates', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findMany).mockResolvedValue([mockTemplate] as never);
    vi.mocked(prisma.template.count).mockResolvedValue(1 as never);

    const { GET } = await import('@/app/api/templates/route');
    const request = createRequest('GET', '/api/templates?page=1&limit=10');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
    expect(data.pagination.page).toBe(1);
  });

  it('applies search filter', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.template.count).mockResolvedValue(0 as never);

    const { GET } = await import('@/app/api/templates/route');
    const request = createRequest('GET', '/api/templates?search=report');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(prisma.template.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'report' }) }),
          ]),
        }),
      }),
    );
  });
});

describe('GET /api/templates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { GET } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('GET', '/api/templates/tpl-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(401);
  });

  it('returns template by id', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);

    const { GET } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('GET', '/api/templates/tpl-1');
    const response = await GET(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Test Template');
  });

  it('returns 404 for non-existent template', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(null as never);

    const { GET } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('GET', '/api/templates/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });

    expect(response.status).toBe(404);
  });
});

describe('PUT /api/templates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { PUT } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('PUT', '/api/templates/tpl-1', { name: 'Updated' });
    const response = await PUT(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(401);
  });

  it('updates template successfully', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
    vi.mocked(prisma.template.update).mockResolvedValue({
      ...mockTemplate,
      name: 'Updated Template',
    } as never);

    const { PUT } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('PUT', '/api/templates/tpl-1', { name: 'Updated Template' });
    const response = await PUT(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.name).toBe('Updated Template');
  });

  it('increments version on templateData update', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
    vi.mocked(prisma.template.update).mockResolvedValue({
      ...mockTemplate,
      version: 2,
    } as never);

    const { PUT } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('PUT', '/api/templates/tpl-1', {
      templateData: { content: [{ type: 'Text' }], root: {} },
    });
    const response = await PUT(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(200);
    expect(prisma.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: 2 }),
      }),
    );
  });

  it('returns 404 for non-existent template', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(null as never);

    const { PUT } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('PUT', '/api/templates/tpl-1', { name: 'Updated' });
    const response = await PUT(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/templates/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { DELETE } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('DELETE', '/api/templates/tpl-1');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(401);
  });

  it('soft deletes template', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
    vi.mocked(prisma.template.update).mockResolvedValue({
      ...mockTemplate,
      deletedAt: new Date(),
    } as never);

    const { DELETE } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('DELETE', '/api/templates/tpl-1');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(200);
    expect(prisma.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });

  it('returns 404 for non-existent template', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(null as never);

    const { DELETE } = await import('@/app/api/templates/[id]/route');
    const request = createRequest('DELETE', '/api/templates/tpl-1');
    const response = await DELETE(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(404);
  });
});

describe('POST /api/templates/[id]/duplicate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(auth).mockResolvedValue(null as any);

    const { POST } = await import('@/app/api/templates/[id]/duplicate/route');
    const request = createRequest('POST', '/api/templates/tpl-1/duplicate');
    const response = await POST(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(401);
  });

  it('duplicates template successfully', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
    vi.mocked(prisma.template.create).mockResolvedValue({
      ...mockTemplate,
      id: 'tpl-2',
      name: 'Test Template (Copy)',
    } as never);

    const { POST } = await import('@/app/api/templates/[id]/duplicate/route');
    const request = createRequest('POST', '/api/templates/tpl-1/duplicate');
    const response = await POST(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.name).toBe('Test Template (Copy)');
    expect(prisma.template.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'Test Template (Copy)',
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('returns 404 for non-existent template', async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.template.findFirst).mockResolvedValue(null as never);

    const { POST } = await import('@/app/api/templates/[id]/duplicate/route');
    const request = createRequest('POST', '/api/templates/tpl-1/duplicate');
    const response = await POST(request, { params: Promise.resolve({ id: 'tpl-1' }) });

    expect(response.status).toBe(404);
  });
});
