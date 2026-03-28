import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

// GET - Get asset counts by category and subcategory
export async function GET(request) {
  try {
    const { search } = new URL(request.url);
    const response = await fetch(getAssetTrackerApiUrl(`/category-counts${search}`), {
      method: 'GET',
      cache: 'no-store',
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Error fetching category counts via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category counts' },
      { status: 500 }
    );
  }
}

