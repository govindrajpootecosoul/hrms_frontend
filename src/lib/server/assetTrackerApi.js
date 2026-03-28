const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function getAssetTrackerApiUrl(path = '') {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}/asset-tracker${normalizedPath}`;
}

export async function proxyJsonResponse(response) {
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : {};
  } catch (_err) {
    body = { success: false, error: text || 'Invalid response from backend' };
  }
  return Response.json(body, { status: response.status });
}
