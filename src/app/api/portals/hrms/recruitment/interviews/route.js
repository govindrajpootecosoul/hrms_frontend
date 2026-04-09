import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// GET - Get all scheduled interviews
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = request.headers.get('x-company') || searchParams.get('company');
    const status = searchParams.get('status');
    const interviewer = searchParams.get('interviewer');
    const date = searchParams.get('date');
    const search = searchParams.get('search');
    
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (interviewer) params.append('interviewer', interviewer);
    if (date) params.append('date', date);
    if (search) params.append('search', search);
    
    const backendUrl = `${API_BASE_URL}/hrms/recruitment/interviews?${params.toString()}`;
    
    console.log('Proxying interviews GET request to:', backendUrl);

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
    console.error('Interviews GET proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

