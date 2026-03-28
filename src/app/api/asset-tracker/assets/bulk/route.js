import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

// POST - Bulk insert assets (used by Excel upload)
export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(getAssetTrackerApiUrl('/assets/bulk'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Error bulk inserting assets via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to bulk insert assets' },
      { status: 500 }
    );
  }
}

