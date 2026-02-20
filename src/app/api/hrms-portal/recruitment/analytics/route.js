import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal recruitment analytics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const month = searchParams.get('month');
    const hr = searchParams.get('hr');
    const department = searchParams.get('department');

    // Forward request to backend
    const params = new URLSearchParams();
    if (company) {
      params.append('company', company);
    }
    if (month) {
      params.append('month', month);
    }
    if (hr) {
      params.append('hr', hr);
    }
    if (department) {
      params.append('department', department);
    }

    const backendUrl = `${API_BASE_URL}/hrms/recruitment/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying recruitment analytics request to:', backendUrl);

    const headers = {};
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Recruitment analytics proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

