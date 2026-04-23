import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function POST(request, ctx) {
  try {
    const resolvedParams = ctx?.params ? await ctx.params : {};
    const { requestId } = resolvedParams || {};
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'requestId is required' }, { status: 400 });
    }

    const qs = new URLSearchParams();
    if (company) qs.append('company', company);

    const backendUrl = `${API_BASE_URL}/employee/team-attendance-requests/${encodeURIComponent(
      requestId
    )}/decide${qs.toString() ? `?${qs.toString()}` : ''}`;

    const headers = { 'Content-Type': 'application/json' };
    if (company) headers['x-company'] = company;
    const authHeader = request.headers.get('authorization');
    if (authHeader) headers['Authorization'] = authHeader;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

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

