import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

export async function GET(request, { params }) {
  try {
    const { assetId } = params;
    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      );
    }
    const { search } = new URL(request.url);
    const response = await fetch(
      getAssetTrackerApiUrl(`/assets/${encodeURIComponent(assetId)}${search}`),
      {
        method: 'GET',
        cache: 'no-store',
      }
    );
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('[API] Error fetching asset via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}
