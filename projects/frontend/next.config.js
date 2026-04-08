/** @type {import('next').NextConfig} */

const raw = process.env.NEXT_PUBLIC_API_URL && String(process.env.NEXT_PUBLIC_API_URL).trim();
if (!raw) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is required. Set it in .env or .env.local (e.g. http://localhost:5008/api).'
  );
}

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: raw.replace(/\/$/, ''),
  },
};

module.exports = nextConfig;
