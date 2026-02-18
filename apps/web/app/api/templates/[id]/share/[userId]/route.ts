import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/templates/[id]/share/[userId] — Revoke access for a user
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, userId } = await params;

  try {
    // Only the owner can revoke access
    const template = await prisma.template.findFirst({
      where: { id, deletedAt: null, ownerId: session.user.id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found or you are not the owner' }, { status: 404 });
    }

    // Cannot remove the owner
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot remove the owner' }, { status: 400 });
    }

    // Find and delete the access
    const access = await prisma.templateAccess.findUnique({
      where: { templateId_userId: { templateId: id, userId } },
    });

    if (!access) {
      return NextResponse.json({ error: 'Access not found' }, { status: 404 });
    }

    await prisma.templateAccess.delete({
      where: { id: access.id },
    });

    return NextResponse.json({ message: 'Access revoked' });
  } catch (error) {
    console.error('[API] DELETE /api/templates/[id]/share/[userId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
