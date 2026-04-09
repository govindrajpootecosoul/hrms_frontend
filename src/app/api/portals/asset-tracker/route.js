import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

// Asset Tracker Portal API Routes
// All Asset Tracker-related API endpoints will be defined here

export async function GET(request) {
  try {
    const { search } = new URL(request.url);
    const response = await fetch(getAssetTrackerApiUrl(`/assets${search}`), {
      method: 'GET',
      cache: 'no-store',
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Asset Tracker API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(getAssetTrackerApiUrl('/assets'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Asset Tracker API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


