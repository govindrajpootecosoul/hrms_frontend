import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for employee portal attendance request submission
export async function POST(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');

    // Forward request to backend
    const params = new URLSearchParams();
    if (company) {
      params.append('company', company);
    }

    const backendUrl = `${API_BASE_URL}/employee/attendance-request${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying attendance request to:', backendUrl);

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
    console.error('Attendance request proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

