import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for HRMS portal recruitment candidates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const status = searchParams.get('status');
    const recruiter = searchParams.get('recruiter');
    const experience = searchParams.get('experience');
    const search = searchParams.get('search');

    const params = new URLSearchParams();
    if (company) params.append('company', company);
    if (status) params.append('status', status);
    if (recruiter) params.append('recruiter', recruiter);
    if (experience) params.append('experience', experience);
    if (search) params.append('search', search);

    const backendUrl = `${API_BASE_URL}/hrms/recruitment/candidates${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying recruitment candidates GET request to:', backendUrl);

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
    console.error('Recruitment candidates GET proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new candidate
export async function POST(request) {
  try {
    const body = await request.json();
    const company = body.company || request.headers.get('x-company');
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/candidates`;
    
    console.log('Proxying recruitment candidates POST request to:', backendUrl);

    const headers = {
      'Content-Type': 'application/json',
    };
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
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
    console.error('Recruitment candidates POST proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
