import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function POST(request, { params }) {
  try {
    const { employeeId } = await params;
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');

    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'employeeId is required' }, { status: 400 });
    }

    const body = await request.json();

    const qs = new URLSearchParams();
    if (company) qs.append('company', company);

    const backendUrl = `${API_BASE_URL}/hrms/leave-balances/${encodeURIComponent(employeeId)}/adjust${qs.toString() ? `?${qs.toString()}` : ''}`;

    const headers = { 'Content-Type': 'application/json' };
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;
    if (company) headers['x-company'] = company;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

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

