import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

// GET - Fetch asset history entries
// Query params:
// - companyId (optional)
// - company (optional, name)
// - type (optional): checkout | checkin | maintenance | broken | created | updated | deleted
// - limit (optional, default 50, max 200)
export async function GET(request) {
  try {
    const { search } = new URL(request.url);
    const response = await fetch(getAssetTrackerApiUrl(`/history${search}`), {
      method: 'GET',
      cache: 'no-store',
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('[API] Error fetching asset history via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch asset history' },
      { status: 500 },
    );
  }
}

// POST - Create an asset history entry (internal use)
export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(getAssetTrackerApiUrl('/history'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('[API] Error creating asset history via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create asset history' },
      { status: 500 },
    );
  }
}


