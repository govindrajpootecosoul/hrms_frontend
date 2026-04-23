import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const managerUserId = searchParams.get('managerUserId');
    const company = searchParams.get('company') || request.headers.get('x-company');
    const status = searchParams.get('status') || 'pending';
    const type = searchParams.get('type') || 'time-off';

    if (!managerUserId) {
      return NextResponse.json({ success: false, error: 'managerUserId is required' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('managerUserId', managerUserId);
    params.append('status', status);
    params.append('type', type);
    if (company) params.append('company', company);

    const backendUrl = `${API_BASE_URL}/employee/team-attendance-requests?${params.toString()}`;

    const headers = {};
    if (company) headers['x-company'] = company;
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

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

