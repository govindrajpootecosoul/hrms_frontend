import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const employeeId = searchParams.get('employeeId');
    const monthYear = searchParams.get('monthYear');
    if (!company) {
      return NextResponse.json({ success: false, error: 'company is required' }, { status: 400 });
    }
    const params = new URLSearchParams();
    params.append('company', company);
    if (employeeId) params.append('employeeId', employeeId);
    if (monthYear) params.append('monthYear', monthYear);

    const backendUrl = `${API_BASE_URL}/hrms/payroll/attendance-adjustment?${params.toString()}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'x-company': company, 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });
    if (!response.ok) {
      const t = await response.text();
      console.error('[attendance-adjustment GET] backend:', response.status, t);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-cache' } });
  } catch (error) {
    console.error('attendance-adjustment GET proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { searchParams } = new URL(request.url);
    const company =
      body.company || searchParams.get('company') || request.headers.get('x-company');
    if (!company) {
      return NextResponse.json({ success: false, error: 'company is required' }, { status: 400 });
    }

    const backendUrl = `${API_BASE_URL}/hrms/payroll/attendance-adjustment`;
    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-company': company,
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!response.ok) {
      const t = await response.text();
      console.error('[attendance-adjustment PUT] backend:', response.status, t);
      return NextResponse.json(
        { success: false, error: t || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    const data = await response.json();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-cache' } });
  } catch (error) {
    console.error('attendance-adjustment PUT proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
