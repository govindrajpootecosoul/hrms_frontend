import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal leave balances (allocation + history)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const employeeId = searchParams.get('employeeId');

    const params = new URLSearchParams();
    if (employeeId) params.append('employeeId', employeeId);
    if (company) params.append('company', company);

    const backendUrl = `${API_BASE_URL}/hrms/leave-balances?${params.toString()}`;

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

