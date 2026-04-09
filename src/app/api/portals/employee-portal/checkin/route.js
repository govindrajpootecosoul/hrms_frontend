import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for employee portal check-in
export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeId } = body;
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Build query params
    const params = new URLSearchParams();
    if (company) {
      params.append('company', company);
    }

    // Forward request to backend (backend uses /api/employee, not /api/employee-portal)
    const backendUrl = `${API_BASE_URL}/employee/checkin${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying check-in request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId }),
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
    console.error('Check-in proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

