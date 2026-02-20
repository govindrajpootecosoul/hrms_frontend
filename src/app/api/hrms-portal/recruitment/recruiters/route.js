import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// GET - Get all recruiters
export async function GET(request) {
  try {
    const company = request.headers.get('x-company') || new URL(request.url).searchParams.get('company');
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/recruiters`;
    
    console.log('Proxying recruiters GET request to:', backendUrl);

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
    console.error('Recruiters GET proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new recruiter
export async function POST(request) {
  try {
    const body = await request.json();
    const company = body.company || request.headers.get('x-company');
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/recruiters`;
    
    console.log('Proxying recruiters POST request to:', backendUrl);

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
      let errorMessage = `Backend error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Recruiters POST proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

