import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// GET - Get single candidate by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Get company from headers (Next.js App Router)
    const headersList = request.headers;
    const company = headersList.get('x-company') || headersList.get('X-Company');
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/candidates/${id}`;
    
    console.log('Proxying recruitment candidate GET request to:', backendUrl);
    console.log('Company:', company);

    const backendHeaders = {
      'Content-Type': 'application/json',
    };
    if (company) {
      backendHeaders['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: backendHeaders,
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
    console.error('Recruitment candidate GET proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update candidate
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get company from headers (Next.js App Router)
    const headersList = request.headers;
    const company = body.company || headersList.get('x-company') || headersList.get('X-Company');
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/candidates/${id}`;
    
    console.log('Proxying recruitment candidate PUT request to:', backendUrl);
    console.log('Company:', company);
    console.log('Body:', body);

    const backendHeaders = {
      'Content-Type': 'application/json',
    };
    if (company) {
      backendHeaders['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: backendHeaders,
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
    console.error('Recruitment candidate PUT proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete candidate
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const company = request.headers.get('x-company') || new URL(request.url).searchParams.get('company');
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/candidates/${id}`;
    
    console.log('Proxying recruitment candidate DELETE request to:', backendUrl);

    const headers = {};
    if (company) {
      headers['x-company'] = company;
    }

    const response = await fetch(backendUrl, {
      method: 'DELETE',
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
    console.error('Recruitment candidate DELETE proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

