import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

// Proxy route for employee portal check-out
export async function POST(request) {
  try {
    const body = await request.json();
    const { employeeId } = body;
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Build query params
    const params = new URLSearchParams();
    if (company) {
      params.append('company', company);
    }

    // Forward request to backend (backend uses /api/employee, not /api/employee-portal)
    const backendUrl = `${API_BASE_URL}/employee/checkout${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('Proxying check-out request to:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId }),
    });

    if (!response.ok) {
      let errorMessage = `Backend error: ${response.status}`;
      try {
        // Clone response to read it without consuming the original
        const clonedResponse = response.clone();
        const errorData = await clonedResponse.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If response is not JSON, try to get text from original response
        try {
          const errorText = await response.text();
          if (errorText) {
            // Try to parse as JSON if it looks like JSON
            try {
              const parsed = JSON.parse(errorText);
              errorMessage = parsed.error || parsed.message || errorText;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch (textError) {
          console.error('Could not parse error response:', textError);
        }
      }
      console.error('Backend checkout error:', response.status, errorMessage);
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Check-out proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

