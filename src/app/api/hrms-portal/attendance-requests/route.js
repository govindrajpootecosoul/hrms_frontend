import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal attendance requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';

    // Forward request to backend
    const params = new URLSearchParams();
    params.append('status', status);
    params.append('type', type);
    if (company) {
      params.append('company', company);
    }

    const backendUrl = `${API_BASE_URL}/hrms/attendance-requests?${params.toString()}`;
    
    console.log('Proxying attendance requests fetch to:', backendUrl);

    const headers = {};
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
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
    console.error('Attendance requests proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

