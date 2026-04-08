/**
 * API base URL from environment only (.env / .env.local in this app root).
 */

const raw = process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim();
if (!raw) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in .env or .env.local');
}

const apiUrl = raw.replace(/\/$/, '');

module.exports = {
  apiUrl,
  getApiUrl: () => apiUrl,
};
