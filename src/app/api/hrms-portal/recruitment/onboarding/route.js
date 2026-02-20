import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal recruitment onboarding
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const recruiter = searchParams.get('recruiter');
    const search = searchParams.get('search');

    const params = new URLSearchParams();
    if (company) params.append('company', company);
    if (status) params.append('status', status);
    if (stage) params.append('stage', stage);
    if (recruiter) params.append('recruiter', recruiter);
    if (search) params.append('search', search);

    const backendUrl = `${API_BASE_URL}/hrms/recruitment/onboarding${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying recruitment onboarding request to:', backendUrl);

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
    console.error('Recruitment onboarding proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

