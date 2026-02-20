import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal approve attendance request
export async function POST(request, { params }) {
  try {
    // In Next.js 15+, params might be a Promise
    const resolvedParams = await params;
    const requestId = resolvedParams?.requestId || params?.requestId;
    
    if (!requestId) {
      console.error('[Approve API] Missing requestId parameter');
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const company = request.headers.get('x-company');

    // Forward request to backend
    // Match the pattern used in reject route: /hrms/attendance-requests/:requestId/approve
    // API_BASE_URL should already point to backend with /api included or there's a rewrite
    const backendUrl = `${API_BASE_URL}/hrms/attendance-requests/${encodeURIComponent(requestId)}/approve`;
    
    console.log('[Approve API] Proxying approve attendance request to:', backendUrl, 'with company:', company);

    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Get auth token from request if available
    const authHeader = request.headers.get('authorization');
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
      console.error('[Approve API] Failed to parse response:', responseText);
      responseData = { success: false, error: responseText || 'Unknown error' };
    }

    if (!response.ok) {
      console.error('[Approve API] Backend error:', response.status, responseData);
      return NextResponse.json(
        { 
          success: false, 
          error: responseData.error || responseData.message || `Backend error: ${response.status}` 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[Approve API] Proxy error:', error);
    console.error('[Approve API] Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error. Please try again.' 
      },
      { status: 500 }
    );
  }
}

