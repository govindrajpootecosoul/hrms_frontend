import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl } from '@/lib/server/assetTrackerApi';

export async function GET() {
  try {
    const response = await fetch(getAssetTrackerApiUrl('/template'), {
      method: 'GET',
      cache: 'no-store',
    });
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          response.headers.get('content-disposition') ||
          'attachment; filename="asset-upload-template.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to download template' },
      { status: 500 }
    );
  }
}

