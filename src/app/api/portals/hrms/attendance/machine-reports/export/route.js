import { API_BASE_URL } from '@/lib/utils/constants';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company') || request.headers.get('x-company');

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeCode = searchParams.get('employeeCode');

    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (employeeCode) params.append('employeeCode', employeeCode);
    if (company) params.append('company', company);

    const backendUrl = `${API_BASE_URL}/hrms/attendance/machine-reports/export${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    const headers = {};
    if (company) headers['x-company'] = company;

    const response = await fetch(backendUrl, { method: 'GET', headers });

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || '';

    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        ...(contentDisposition ? { 'Content-Disposition': contentDisposition } : {}),
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

