import { NextRequest, NextResponse } from 'next/server';
import type { Data } from '@puckeditor/core';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderRequestSchema } from '@/lib/validation/render-schemas';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate input
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

  const { templateId, templateData: inlineTemplateData, data, format, pageConfig } = parsed.data;

  try {
    // 3. Resolve template data
    let templateData: Data;

    if (inlineTemplateData) {
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

      templateData = template.templateData as Data;
    } else {
      return NextResponse.json(
        { error: 'Either templateId or templateData must be provided' },
        { status: 400 },
      );
    }

    // 4. Render report - dynamic import to avoid bundling react-dom/server
    const { renderReport } = await import('@/lib/rendering/render-report');
    const result = await renderReport({
      templateData,
      data,
      format,
      pageConfig,
    });

    // 5. Return result
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
    console.error('[API] Render error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
