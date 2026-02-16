import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal reject attendance request
export async function POST(request, { params }) {
  try {
    const { requestId } = params;
    const body = await request.json();
    const company = request.headers.get('x-company');

    // Forward request to backend
    const backendUrl = `${API_BASE_URL}/hrms/attendance-requests/${requestId}/reject`;
    
    console.log('Proxying reject attendance request to:', backendUrl);

    const headers = {
      'Content-Type': 'application/json',
    };
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reject attendance request proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

