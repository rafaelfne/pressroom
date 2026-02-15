import { NextRequest, NextResponse } from 'next/server';
import type { Data } from '@puckeditor/core';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderRequestSchema } from '@/lib/validation/render-schemas';
import { checkRateLimit } from '@/lib/rendering/rate-limiter';

export const runtime = 'nodejs';

const DEFAULT_RENDER_TIMEOUT_MS = 60_000;

class RenderTimeoutError extends Error {
  constructor() {
    super('Render timeout exceeded');
    this.name = 'RenderTimeoutError';
  }
}

/**
 * Get the render timeout from environment variable or use default (60s)
 */
function getRenderTimeout(): number {
  const envTimeout = process.env.RENDER_TIMEOUT_MS;
  if (envTimeout) {
    const parsed = parseInt(envTimeout, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_RENDER_TIMEOUT_MS;
}

/**
 * Wrap a promise with a timeout. Rejects with an error if the timeout expires.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new RenderTimeoutError());
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Attach rate limit headers to a response
 */
function withRateLimitHeaders(
  response: NextResponse,
  rateLimit: { limit: number; remaining: number; resetAt: number },
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());
  return response;
}

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limiting
  const rateLimit = checkRateLimit(session.user.id);
  if (!rateLimit.allowed) {
    return withRateLimitHeaders(
      NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 },
      ),
      rateLimit,
    );
  }

  // 3. Validate input
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = renderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { templateId, templateData: inlineTemplateData, pages: inlinePages, data, format, pageConfig } = parsed.data;

  try {
    // 4. Resolve template data
    let templateData: Data | undefined;
    let pages: Array<{ id: string; name: string; content: Data }> | undefined;

    if (inlinePages) {
      pages = inlinePages as Array<{ id: string; name: string; content: Data }>;
    } else if (inlineTemplateData) {
      templateData = inlineTemplateData as Data;
    } else if (templateId) {
      // Fetch user's org
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { organizationId: true },
      });

      if (!user?.organizationId) {
        return NextResponse.json({ error: 'User has no organization' }, { status: 403 });
      }

      // Fetch template
      const template = await prisma.template.findFirst({
        where: {
          id: templateId,
          organizationId: user.organizationId,
          deletedAt: null,
        },
      });

      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      // Check if template uses multi-page format
      const storedData = template.templateData as Record<string, unknown>;
      if (storedData && Array.isArray(storedData.pages)) {
        pages = storedData.pages as Array<{ id: string; name: string; content: Data }>;
      } else {
        templateData = template.templateData as Data;
      }
    } else {
      return NextResponse.json(
        { error: 'Either templateId, templateData, or pages must be provided' },
        { status: 400 },
      );
    }

    // 5. Render report with timeout - dynamic import to avoid bundling react-dom/server
    const { renderReport } = await import('@/lib/rendering/render-report');
    const renderPromise = renderReport({
      templateData,
      pages,
      data,
      format,
      pageConfig,
    });

    const result = await withTimeout(renderPromise, getRenderTimeout());

    // 6. Return result
    if (format === 'html') {
      return new NextResponse(result.content as string, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // PDF response
    const buffer = result.content as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="report.pdf"',
      },
    });
  } catch (error) {
    if (error instanceof RenderTimeoutError) {
      return NextResponse.json(
        { error: 'Render timeout exceeded' },
        { status: 504 },
      );
    }
    console.error('[API] Render error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
