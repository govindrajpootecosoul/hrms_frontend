import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for employee portal attendance requests
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const company = searchParams.get('company') || request.headers.get('x-company');

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    if (company) {
      params.append('company', company);
    }

    // Backend routes are mounted at /api/employee, not /api/employee-portal
    const backendUrl = `${API_BASE_URL}/employee/attendance-requests?${params.toString()}`;
    
    console.log('[Employee Portal API] Proxying attendance requests to:', backendUrl);

    const headers = {};
    if (company) {
      headers['x-company'] = company;
    }

    // Forward auth token if available
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Employee Portal API] Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Employee Portal API] Attendance requests proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

