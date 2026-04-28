import { NextResponse } from 'next/server';

// Server time endpoint for client clock sync (anti-tamper).
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      serverTimeMs: Date.now(),
    },
  });
}

