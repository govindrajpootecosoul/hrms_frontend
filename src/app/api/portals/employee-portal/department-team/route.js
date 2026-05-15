import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const userId = searchParams.get('userId');
    const company = searchParams.get('company') || request.headers.get('x-company');

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'employeeId is required' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('employeeId', employeeId);
    if (userId) params.append('userId', userId);
    if (company) params.append('company', company);

    const backendUrl = `${API_BASE_URL}/employee/department-team?${params.toString()}`;
    const headers = { 'Content-Type': 'application/json' };
    if (company) headers['x-company'] = company;
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers.Authorization = authHeader;

    const response = await fetch(backendUrl, { method: 'GET', headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data?.error || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
