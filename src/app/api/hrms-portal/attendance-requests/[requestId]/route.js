import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils/constants';

const buildHeaders = (request) => {
  const headers = { 'Content-Type': 'application/json' };
  const company = request.headers.get('x-company');
  const authHeader = request.headers.get('authorization');
  if (authHeader) headers['Authorization'] = authHeader;
  if (company) headers['x-company'] = company;
  return headers;
};

const parseBackendResponse = async (response, label) => {
  const responseText = await response.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (e) {
    console.error(`[${label}] Failed to parse response:`, responseText);
    responseData = { success: false, error: responseText || 'Unknown error' };
  }
  return { responseText, responseData };
};

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const requestId = resolvedParams?.requestId || params?.requestId;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const backendUrl = `${API_BASE_URL}/hrms/attendance-requests/${encodeURIComponent(requestId)}`;

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: buildHeaders(request),
      body: JSON.stringify(body),
    });

    const { responseData } = await parseBackendResponse(response, 'AttendanceRequest PUT');

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: responseData.error || responseData.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[AttendanceRequest PUT] Proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const requestId = resolvedParams?.requestId || params?.requestId;

    if (!requestId) {
      return NextResponse.json({ success: false, error: 'Request ID is required' }, { status: 400 });
    }

    const backendUrl = `${API_BASE_URL}/hrms/attendance-requests/${encodeURIComponent(requestId)}`;

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: buildHeaders(request),
    });

    const { responseData } = await parseBackendResponse(response, 'AttendanceRequest DELETE');

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: responseData.error || responseData.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('[AttendanceRequest DELETE] Proxy error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}


