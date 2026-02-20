import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal reject attendance request
export async function POST(request, { params }) {
  try {
    // In Next.js 15+, params might be a Promise
    const resolvedParams = await params;
    const requestId = resolvedParams?.requestId || params?.requestId;

    if (!requestId) {
      console.error('[Reject API] Missing requestId parameter');
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const company = request.headers.get('x-company');
    const authHeader = request.headers.get('authorization');

    // Forward request to backend
    const backendUrl = `${API_BASE_URL}/hrms/attendance-requests/${encodeURIComponent(requestId)}/reject`;
    
    console.log('[Reject API] Proxying reject attendance request to:', backendUrl, 'with company:', company);

    const headers = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Reject API] Failed to parse response:', responseText);
      responseData = { success: false, error: responseText || 'Unknown error' };
    }

    if (!response.ok) {
      console.error('[Reject API] Backend error:', response.status, responseData);
      return NextResponse.json(
        {
          success: false,
          error: responseData.error || responseData.message || `Backend error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[Reject API] Proxy error:', error);
    console.error('[Reject API] Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

