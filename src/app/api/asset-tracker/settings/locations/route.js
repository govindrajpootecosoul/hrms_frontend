import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

export async function GET(request) {
  try {
    const { search } = new URL(request.url);
    const response = await fetch(getAssetTrackerApiUrl(`/settings/locations${search}`), {
      method: 'GET',
      cache: 'no-store',
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Error fetching location settings via backend:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch locations' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const response = await fetch(getAssetTrackerApiUrl('/settings/locations'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Error saving location settings via backend:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save locations' }, { status: 500 });
  }
}


