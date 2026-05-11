import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for employee portal "requests" dashboard data (leaveBalances, recentRequests)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const company = searchParams.get('company') || request.headers.get('x-company');

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'employeeId is required' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    if (company) params.append('company', company);

    // Backend employee portal is mounted at /api/employee
    const backendUrl = `${API_BASE_URL}/employee/requests?${params.toString()}`;

    const headers = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;
    if (company) headers['x-company'] = company;

    const response = await fetch(backendUrl, { method: 'GET', headers });
    const text = await response.text();
    const json = (() => {
      try {
        return JSON.parse(text);
      } catch {
        return { success: false, error: text || 'Invalid response' };
      }
    })();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: json.error || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

