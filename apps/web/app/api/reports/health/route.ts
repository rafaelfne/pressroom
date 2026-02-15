import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'pressroom-rendering',
    timestamp: new Date().toISOString(),
  });
}
