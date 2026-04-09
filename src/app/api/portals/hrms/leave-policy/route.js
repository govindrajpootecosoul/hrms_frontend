import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    const params = new URLSearchParams();
    if (company) params.append('company', company);

    const backendUrl = `${API_BASE_URL}/hrms/leave-policy?${params.toString()}`;
    
    const headers = {};
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json({ success: false, error: `Backend error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('HRMS leave-policy proxy error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { company, ...policyData } = body;

    const params = new URLSearchParams();
    if (company) params.append('company', company);

    const backendUrl = `${API_BASE_URL}/hrms/leave-policy?${params.toString()}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(policyData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json({ success: false, error: `Backend error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('HRMS leave-policy PUT proxy error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

