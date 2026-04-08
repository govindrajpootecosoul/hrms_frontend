/**
 * Frontend network / API base URL — from environment only (.env / .env.local).
 * No host/port fallbacks are defined in this file.
 */

const raw = process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim();
if (!raw) {
  throw new Error(
    'NEXT_PUBLIC_API_URL must be set in .env or .env.local (e.g. http://localhost:5008/api).'
  );
}

const apiUrl = raw.replace(/\/$/, '');

module.exports = {
  apiUrl,
  getApiUrl: () => apiUrl,
};
