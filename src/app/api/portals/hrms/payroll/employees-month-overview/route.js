import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const monthYear = searchParams.get('monthYear');
    const payrollCompany = searchParams.get('payrollCompany');
    if (!company) {
      return NextResponse.json({ success: false, error: 'company is required' }, { status: 400 });
    }
    if (!monthYear) {
      return NextResponse.json({ success: false, error: 'monthYear is required' }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append('company', company);
    params.append('monthYear', monthYear);
    if (payrollCompany && payrollCompany !== 'all') params.append('payrollCompany', payrollCompany);

    const backendUrl = `${API_BASE_URL}/hrms/payroll/employees-month-overview?${params.toString()}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'x-company': company, 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const t = await response.text();
      console.error('[employees-month-overview] backend error:', response.status, t);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-cache' } });
  } catch (error) {
    console.error('employees-month-overview proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
