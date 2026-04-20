import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Proxy route for HRMS portal attendance statistics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');
    const companyId = searchParams.get('companyId');
    const date = searchParams.get('date');
    const department = searchParams.get('department');

    // Forward request to backend
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }
    if (company) {
      params.append('company', company);
    }
    // Also forward companyId so backend can normalize it (e.g. '1' → 'Ecosoul Home', '2' → 'Thrive')
    if (companyId) {
      params.append('companyId', companyId);
    }
    if (department && department !== 'all') {
      params.append('department', department);
    }

    const backendUrl = `${API_BASE_URL}/hrms/attendance/stats${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying attendance stats to:', backendUrl);

    const headers = {};
    if (company) {
      headers['x-company'] = company;
    }
    const inm = request.headers.get('if-none-match');
    if (inm) {
      headers['if-none-match'] = inm;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        ...headers,
        // allow backend to do conditional 304 responses (ETag)
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store', // Prevent Next.js from caching
    });

    if (response.status === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: response.headers.get('etag') || '',
          'Cache-Control': 'no-cache',
        },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Attendance Stats Proxy] Backend response:', JSON.stringify(data, null, 2));
    
    // Return with revalidation-friendly headers (ETag) so client can poll cheaply.
    return NextResponse.json(data, {
      headers: {
        ETag: response.headers.get('etag') || '',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Attendance stats proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

