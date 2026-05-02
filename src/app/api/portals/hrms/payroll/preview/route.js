import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const companyId = searchParams.get('companyId');

    const employeeId = searchParams.get('employeeId');
    const monthYear = searchParams.get('monthYear');
    const annualCtc = searchParams.get('annualCtc');
    const basicPercentOfCtc = searchParams.get('basicPercentOfCtc');
    const hraPercentOfBasic = searchParams.get('hraPercentOfBasic');

    const params = new URLSearchParams();
    if (company) params.append('company', company);
    if (companyId) params.append('companyId', companyId);
    if (employeeId) params.append('employeeId', employeeId);
    if (monthYear) params.append('monthYear', monthYear);
    if (annualCtc) params.append('annualCtc', annualCtc);
    if (basicPercentOfCtc) params.append('basicPercentOfCtc', basicPercentOfCtc);
    if (hraPercentOfBasic) params.append('hraPercentOfBasic', hraPercentOfBasic);

    const backendUrl = `${API_BASE_URL}/hrms/payroll/preview${params.toString() ? `?${params.toString()}` : ''}`;

    const headers = {};
    if (company) headers['x-company'] = company;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        ...headers,
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[payroll/preview proxy] backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    console.error('Payroll preview proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

