import { NextResponse } from 'next/server';
import { getAssetTrackerApiUrl, proxyJsonResponse } from '@/lib/server/assetTrackerApi';

export async function GET(request) {
  try {
    const { search } = new URL(request.url);
    const response = await fetch(getAssetTrackerApiUrl(`/assets${search}`), {
      method: 'GET',
      cache: 'no-store',
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('[API] Error fetching assets via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch assets' },
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
    console.error('[API] Error creating asset via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create asset' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const response = await fetch(getAssetTrackerApiUrl('/assets'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Error updating asset via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { search } = new URL(request.url);
    const response = await fetch(getAssetTrackerApiUrl(`/assets${search}`), {
      method: 'DELETE',
    });
    return proxyJsonResponse(response);
  } catch (error) {
    console.error('Error deleting asset via backend:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

